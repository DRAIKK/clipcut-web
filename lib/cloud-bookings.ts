import type { Barber, Booking, PaymentMethodId, Service, TimeSlot } from "../app/types/booking";

export const CREATE_BOOKING_URL = process.env.NEXT_PUBLIC_CREATE_BOOKING_URL ?? "https://us-central1-clipcut-3053d.cloudfunctions.net/api/booking/create";

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

type CreateBookingResponse = {
  bookingId: string;
};

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function parsePrice(price: string) {
  const normalized = price.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : price;
}

export function buildBookingPayload({ barber, clientEmail, clientId, clientName, paymentMethod, service, slot }: CreateBookingInput) {
  const missingFields: string[] = [];
  const servicePrice = parsePrice(service.price);

  if (!isNonEmptyString(clientId)) missingFields.push("uid");
  if (!isNonEmptyString(barber.id)) missingFields.push("barberId");
  if (!isNonEmptyString(service.name)) missingFields.push("service.name");
  if (typeof servicePrice !== "number" || servicePrice <= 0) missingFields.push("service.price");
  if (!isNonEmptyString(slot.id)) missingFields.push("slotId");
  if (!isNonEmptyString(paymentMethod)) missingFields.push("paymentMethod");

  if (missingFields.length > 0) {
    throw new Error(`No se puede crear la reserva: faltan campos requeridos (${missingFields.join(", ")}).`);
  }

  const backendPaymentMethod = paymentMethod === "cash" ? "cash" : "mp";
  const status: Booking["status"] = backendPaymentMethod === "cash" ? "cash_pending" : "pending_payment";

  return {
    clientId,
    clientName: clientName ?? "",
    clientEmail: clientEmail ?? "",
    barberId: barber.id,
    barberName: barber.name,
    barberAddress: barber.address,
    serviceId: service.id,
    serviceName: service.name,
    servicePrice,
    slotId: slot.id,
    day: slot.day ?? "",
    startTime: slot.startTime ?? slot.label,
    endTime: slot.endTime ?? "",
    paymentMethod: backendPaymentMethod,
    status,
  };
}

export async function createBookingFromWeb(input: CreateBookingInput) {
  if (!CREATE_BOOKING_URL) {
    throw new Error("No está configurado el endpoint de reservas.");
  }

  const response = await fetch(CREATE_BOOKING_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildBookingPayload(input)),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("create booking error body", errorBody);
    throw new Error(errorBody || "No se pudo crear la reserva. Probá nuevamente.");
  }

  const data = (await response.json()) as CreateBookingResponse;
  if (!data.bookingId) {
    throw new Error("El backend no devolvió el identificador de la reserva.");
  }

  return data;
}
