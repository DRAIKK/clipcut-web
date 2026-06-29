import type { buildBookingPayload } from "./firestore-bookings";

export const MP_CREATE_PREFERENCE_URL = process.env.NEXT_PUBLIC_MP_CREATE_PREFERENCE_URL ?? "https://us-central1-clipcut-3053d.cloudfunctions.net/api/mp/create-preference";

type BookingPayload = ReturnType<typeof buildBookingPayload>;

export type MercadoPagoPreferencePayload = {
  userId: string;
  barberId: string;
  barberName: string;
  barberAddress: string;
  clientId: string;
  serviceId: string;
  serviceName: string;
  price: number | string;
  slotId: string;
  day: string;
  startTime: string;
  endTime: string;
  paymentMethod: BookingPayload["paymentMethod"];
  email: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
};

type MercadoPagoPreferenceResponse = {
  init_point?: string;
  sandbox_init_point?: string;
};

type MercadoPagoPreferenceInput = {
  booking: BookingPayload;
  email: string;
  failureUrl: string;
  pendingUrl: string;
  successUrl: string;
};

function hasValue(value: number | string) {
  if (typeof value === "number") return Number.isFinite(value) && value > 0;
  return value.trim().length > 0;
}

function assertRequiredField(fieldName: keyof MercadoPagoPreferencePayload, value: number | string) {
  if (!hasValue(value)) {
    throw new Error(`Falta ${fieldName} para iniciar Mercado Pago.`);
  }
}

export function buildMercadoPagoPreferencePayload({ booking, email, failureUrl, pendingUrl, successUrl }: MercadoPagoPreferenceInput): MercadoPagoPreferencePayload {
  const payload = {
    userId: booking.clientId,
    barberId: booking.barberId,
    barberName: booking.barberName,
    barberAddress: booking.barberAddress,
    clientId: booking.clientId,
    serviceId: booking.serviceId,
    serviceName: booking.serviceName,
    price: booking.servicePrice,
    slotId: booking.slotId,
    day: booking.day,
    startTime: booking.startTime,
    endTime: booking.endTime,
    paymentMethod: booking.paymentMethod,
    email,
    successUrl,
    failureUrl,
    pendingUrl,
  } satisfies MercadoPagoPreferencePayload;

  assertRequiredField("userId", payload.userId);
  assertRequiredField("barberId", payload.barberId);
  assertRequiredField("barberName", payload.barberName);
  assertRequiredField("barberAddress", payload.barberAddress);
  assertRequiredField("clientId", payload.clientId);
  assertRequiredField("serviceId", payload.serviceId);
  assertRequiredField("serviceName", payload.serviceName);
  assertRequiredField("price", payload.price);
  assertRequiredField("slotId", payload.slotId);
  assertRequiredField("day", payload.day);
  assertRequiredField("startTime", payload.startTime);
  assertRequiredField("endTime", payload.endTime);
  assertRequiredField("paymentMethod", payload.paymentMethod);
  assertRequiredField("email", payload.email);
  assertRequiredField("successUrl", payload.successUrl);
  assertRequiredField("failureUrl", payload.failureUrl);
  assertRequiredField("pendingUrl", payload.pendingUrl);

  return payload;
}

export async function createMercadoPagoPreference(payload: MercadoPagoPreferencePayload) {
  if (!MP_CREATE_PREFERENCE_URL) {
    throw new Error("No está configurado el endpoint de Mercado Pago.");
  }

  console.log("MP ENDPOINT", MP_CREATE_PREFERENCE_URL);
  console.log("MP PAYLOAD FINAL", JSON.stringify(payload, null, 2));

  const response = await fetch(MP_CREATE_PREFERENCE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("MP error body", errorBody);
    throw new Error(errorBody || "No se pudo iniciar Mercado Pago. Probá nuevamente.");
  }

  return (await response.json()) as MercadoPagoPreferenceResponse;
}
