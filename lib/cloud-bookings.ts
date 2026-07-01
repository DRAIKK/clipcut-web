import type { Barber, Booking, PaymentMethodId, Service, TimeSlot } from "../app/types/booking";

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


export function createBookingFromWeb(input: CreateBookingInput): never {
  buildBookingPayload(input);

  // Firestore rules in this repo do not expose a client-allowed booking create path,
  // and Clipcut Web must not write directly to collection("bookings"). The mobile
  // creation backend/callable is not present in this web codebase, so stop here
  // instead of retrying a Firestore write that will fail with permission-denied.
  throw new Error("La web necesita un endpoint backend para crear la reserva.");
}
