import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import type { Barber, Booking, PaymentMethodId, Service, TimeSlot } from "../app/types/booking";
import { db, functions } from "./firebase";

type BookingPaymentMethod = PaymentMethodId | "mp";

type CreateBookingInput = {
  barber: Barber;
  clientEmail?: string;
  clientId: string;
  clientName?: string;
  paymentMethod: BookingPaymentMethod;
  service: Service;
  slot: TimeSlot;
};

type BookingFunctionResponse = {
  booking?: Partial<Booking> & { id?: string };
  bookingId?: string;
  id?: string;
  status?: string;
};

type BookingPayload = ReturnType<typeof buildBookingPayload>;

function parsePrice(price: string) {
  const normalized = price.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : price;
}

function removeUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(removeUndefinedDeep) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefinedDeep(v)]),
    ) as T;
  }

  return value;
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateNoInvalidFirestoreValues(value: unknown, path = "bookingPayload") {
  if (value === undefined) {
    throw new Error(`${path} no puede ser undefined.`);
  }

  if (typeof value === "number" && Number.isNaN(value)) {
    throw new Error(`${path} no puede ser NaN.`);
  }

  if (value instanceof Date && Number.isNaN(value.getTime())) {
    throw new Error(`${path} no puede ser una Date inválida.`);
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => validateNoInvalidFirestoreValues(item, `${path}[${index}]`));
    return;
  }

  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
      validateNoInvalidFirestoreValues(nestedValue, `${path}.${key}`);
    });
  }
}

function validatePendingPaymentBookingPayload(bookingPayload: BookingPayload) {
  const missingFields: string[] = [];

  if (!isNonEmptyString(bookingPayload.barberId)) missingFields.push("barberId");
  if (!isNonEmptyString(bookingPayload.clientId)) missingFields.push("clientId");
  if (!isNonEmptyString(bookingPayload.serviceId)) missingFields.push("serviceId");
  if (!isNonEmptyString(bookingPayload.serviceName)) missingFields.push("serviceName");
  if (typeof bookingPayload.servicePrice !== "number" || bookingPayload.servicePrice <= 0) missingFields.push("servicePrice");
  if (!isNonEmptyString(bookingPayload.slotId)) missingFields.push("slotId");
  if (bookingPayload.paymentMethod !== "mp") missingFields.push("paymentMethod");
  if (bookingPayload.status !== "pending_payment") missingFields.push("status");

  if (missingFields.length > 0) {
    throw new Error(`No se puede crear la reserva: payload inválido (${missingFields.join(", ")}).`);
  }

  validateNoInvalidFirestoreValues(bookingPayload);
}

function prepareBookingPayloadForCreate(bookingPayload: BookingPayload) {
  console.log("booking payload before create", JSON.stringify(bookingPayload, null, 2));

  const cleanBookingPayload = removeUndefinedDeep(bookingPayload);

  console.log("clean booking payload", JSON.stringify(cleanBookingPayload, null, 2));
  validateNoInvalidFirestoreValues(cleanBookingPayload);

  if (cleanBookingPayload.paymentMethod === "mp" || cleanBookingPayload.status === "pending_payment") {
    validatePendingPaymentBookingPayload(cleanBookingPayload);
  }

  return cleanBookingPayload;
}

export function buildBookingPayload({ barber, clientEmail, clientId, clientName, paymentMethod, service, slot }: CreateBookingInput) {
  if (!clientId) throw new Error("Iniciá sesión para reservar.");
  if (!barber.id || !service.id || !slot.id || !paymentMethod) {
    throw new Error("Elegí servicio, horario y método de pago para continuar.");
  }

  const status: Booking["status"] = paymentMethod === "cash" ? "cash_pending" : "pending_payment";

  return {
    clientId,
    clientName: clientName ?? "",
    clientEmail: clientEmail ?? "",
    barberId: barber.id,
    barberName: barber.name,
    barberAddress: barber.address,
    serviceId: service.id,
    serviceName: service.name,
    servicePrice: parsePrice(service.price),
    slotId: slot.id,
    day: slot.day ?? "",
    startTime: slot.startTime ?? slot.label,
    endTime: slot.endTime ?? "",
    paymentMethod,
    status,
  };
}

function payloadToBooking(id: string, payload: BookingPayload, status: Booking["status"]): Booking {
  return {
    id,
    barberId: payload.barberId,
    barberName: payload.barberName,
    serviceId: payload.serviceId,
    serviceName: payload.serviceName,
    servicePrice: payload.servicePrice,
    slotId: payload.slotId,
    day: payload.day,
    startTime: payload.startTime,
    endTime: payload.endTime,
    dateTime: [payload.day, payload.startTime].filter(Boolean).join(" · "),
    address: payload.barberAddress,
    status,
    paymentMethod: payload.paymentMethod,
  };
}

function responseToBooking(payload: BookingPayload, response: BookingFunctionResponse): Booking {
  const booking = response.booking ?? {};
  const id = booking.id ?? response.bookingId ?? response.id;

  if (!id) throw new Error("La reserva fue creada, pero no recibimos el ID de la reserva.");

  return payloadToBooking(id, payload, booking.status ?? response.status ?? payload.status);
}

export async function createBooking(input: CreateBookingInput) {
  if (!functions) throw new Error("Firebase Functions no está configurado.");

  const bookingPayload = buildBookingPayload(input);
  const cleanBookingPayload = prepareBookingPayloadForCreate(bookingPayload);
  const callable = httpsCallable<typeof cleanBookingPayload, BookingFunctionResponse>(functions, "createBooking");
  const result = await callable(cleanBookingPayload);

  return responseToBooking(cleanBookingPayload, result.data);
}

export async function createFirestoreBooking(input: CreateBookingInput) {
  if (!db) throw new Error("Firebase Firestore no está configurado.");

  const bookingPayload = buildBookingPayload(input);
  const cleanBookingPayload = prepareBookingPayloadForCreate(bookingPayload);
  const document = {
    ...cleanBookingPayload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const reference = await addDoc(collection(db, "bookings"), document);

  return payloadToBooking(reference.id, cleanBookingPayload, cleanBookingPayload.status);
}
