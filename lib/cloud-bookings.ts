import { httpsCallable } from "firebase/functions";
import type { Barber, Booking, PaymentMethodId, Service, TimeSlot } from "../app/types/booking";
import { functions } from "./firebase";

type BookingPaymentMethod = PaymentMethodId | "mp";

const CREATE_BOOKING_FUNCTION_NAME = "createBooking";

type CreateBookingInput = {
  barber: Barber;
  clientEmail?: string;
  clientId: string;
  clientName?: string;
  paymentMethod: BookingPaymentMethod;
  service: Service;
  slot: TimeSlot;
};

type BookingPayload = ReturnType<typeof buildBookingPayload>;

type CallableBookingResponse = {
  bookingId?: string;
  id?: string;
  booking?: {
    id?: string;
    bookingId?: string;
  };
};

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

function validateNoInvalidValues(value: unknown, path = "bookingPayload") {
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
    value.forEach((item, index) => validateNoInvalidValues(item, `${path}[${index}]`));
    return;
  }

  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
      validateNoInvalidValues(nestedValue, `${path}.${key}`);
    });
  }
}

function getMissingBookingPayloadFields(bookingPayload: BookingPayload) {
  const missingFields: string[] = [];

  if (!isNonEmptyString(bookingPayload.barberId)) missingFields.push("barberId");
  if (!isNonEmptyString(bookingPayload.clientId)) missingFields.push("clientId");
  if (!isNonEmptyString(bookingPayload.serviceId)) missingFields.push("serviceId");
  if (!isNonEmptyString(bookingPayload.serviceName)) missingFields.push("serviceName");
  if (typeof bookingPayload.servicePrice !== "number" || bookingPayload.servicePrice <= 0) missingFields.push("servicePrice");
  if (!isNonEmptyString(bookingPayload.slotId)) missingFields.push("slotId");
  if (!isNonEmptyString(bookingPayload.paymentMethod)) missingFields.push("paymentMethod");
  if (!isNonEmptyString(bookingPayload.status)) missingFields.push("status");

  return missingFields;
}

function validateBookingPayloadForCreate(bookingPayload: BookingPayload) {
  const missingFields = getMissingBookingPayloadFields(bookingPayload);

  if (missingFields.length > 0) {
    throw new Error(`No se puede crear la reserva: faltan campos requeridos (${missingFields.join(", ")}).`);
  }

  if (bookingPayload.paymentMethod === "mp" && bookingPayload.status !== "pending_payment") {
    throw new Error("No se puede crear la reserva: paymentMethod mp requiere status pending_payment.");
  }

  validateNoInvalidValues(bookingPayload);
}

function logCreateBookingDebug(label: string, bookingPayload: BookingPayload, extra?: Record<string, unknown>) {
  console.error(label, {
    cloudFunction: CREATE_BOOKING_FUNCTION_NAME,
    payload: bookingPayload,
    uid: bookingPayload.clientId,
    barberId: bookingPayload.barberId,
    slotId: bookingPayload.slotId,
    service: {
      id: bookingPayload.serviceId,
      name: bookingPayload.serviceName,
      price: bookingPayload.servicePrice,
    },
    paymentMethod: bookingPayload.paymentMethod,
    ...extra,
  });
}

function prepareBookingPayloadForCreate(bookingPayload: BookingPayload) {
  console.log("mobile-like booking payload", bookingPayload);

  const cleanBookingPayload = removeUndefinedDeep(bookingPayload);

  validateNoInvalidValues(cleanBookingPayload);

  validateBookingPayloadForCreate(cleanBookingPayload);

  return cleanBookingPayload;
}

export function buildBookingPayload({ barber, clientEmail, clientId, clientName, paymentMethod, service, slot }: CreateBookingInput) {
  const missingFields: string[] = [];

  if (!isNonEmptyString(clientId)) missingFields.push("uid");
  if (!isNonEmptyString(barber.id)) missingFields.push("barberId");
  if (!isNonEmptyString(service.id)) missingFields.push("service.id");
  if (!isNonEmptyString(service.name)) missingFields.push("service.name");
  if (!isNonEmptyString(service.price)) missingFields.push("service.price");
  if (!isNonEmptyString(slot.id)) missingFields.push("slotId");
  if (!isNonEmptyString(paymentMethod)) missingFields.push("paymentMethod");

  if (missingFields.length > 0) {
    throw new Error(`No se puede crear la reserva: faltan campos requeridos (${missingFields.join(", ")}).`);
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

function getBookingId(response: CallableBookingResponse) {
  return response.bookingId ?? response.id ?? response.booking?.bookingId ?? response.booking?.id;
}

export async function createBooking(input: CreateBookingInput) {
  if (!functions) throw new Error("Firebase Functions no está configurado.");

  const cleanBookingPayload = prepareBookingPayloadForCreate(buildBookingPayload(input));
  const createBookingFunction = httpsCallable<BookingPayload, CallableBookingResponse>(functions, CREATE_BOOKING_FUNCTION_NAME);

  logCreateBookingDebug("createBooking callable request", cleanBookingPayload);

  let result;
  try {
    result = await createBookingFunction(cleanBookingPayload);
  } catch (error) {
    logCreateBookingDebug("createBooking callable failed", cleanBookingPayload, {
      code: error instanceof Error && "code" in error ? (error as { code?: unknown }).code : undefined,
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      raw: error,
    });
    throw error;
  }
  const bookingId = getBookingId(result.data);

  if (!bookingId) {
    throw new Error("La función no devolvió el ID de la reserva.");
  }

  console.log("created bookingId from function", bookingId);

  return payloadToBooking(bookingId, cleanBookingPayload, cleanBookingPayload.status);
}
