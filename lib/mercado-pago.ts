import type { buildBookingPayload } from "./firestore-bookings";

export const MP_CREATE_PREFERENCE_URL = process.env.NEXT_PUBLIC_MP_CREATE_PREFERENCE_URL ?? "https://us-central1-clipcut-3053d.cloudfunctions.net/api/mp/create-preference";

type BookingPayload = ReturnType<typeof buildBookingPayload>;

export type MercadoPagoPreferencePayload = {
  barberId: string;
  clientId: string;
  slotId: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number | string;
  start: string;
  end: string;
  date: string;
  paymentMethod: BookingPayload["paymentMethod"];
  payerEmail: string;
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
  failureUrl: string;
  payerEmail: string;
  pendingUrl: string;
  successUrl: string;
};

function hasValue(value: number | string) {
  if (typeof value === "number") return Number.isFinite(value) && value > 0;
  return value.trim().length > 0;
}

function assertRequiredField(fieldName: keyof MercadoPagoPreferencePayload, value: number | string) {
  if (!hasValue(value)) {
    throw new Error(`Falta ${fieldName} para iniciar el pago.`);
  }
}

export function buildMercadoPagoPreferencePayload({ booking, failureUrl, payerEmail, pendingUrl, successUrl }: MercadoPagoPreferenceInput): MercadoPagoPreferencePayload {
  const payload = {
    barberId: booking.barberId,
    clientId: booking.clientId,
    slotId: booking.slotId,
    serviceId: booking.serviceId,
    serviceName: booking.serviceName,
    servicePrice: booking.servicePrice,
    start: booking.startTime,
    end: booking.endTime,
    date: booking.day,
    paymentMethod: booking.paymentMethod,
    payerEmail,
    successUrl,
    failureUrl,
    pendingUrl,
  } satisfies MercadoPagoPreferencePayload;

  assertRequiredField("barberId", payload.barberId);
  assertRequiredField("clientId", payload.clientId);
  assertRequiredField("slotId", payload.slotId);
  assertRequiredField("serviceId", payload.serviceId);
  assertRequiredField("serviceName", payload.serviceName);
  assertRequiredField("servicePrice", payload.servicePrice);
  assertRequiredField("start", payload.start);
  assertRequiredField("end", payload.end);
  assertRequiredField("date", payload.date);
  assertRequiredField("paymentMethod", payload.paymentMethod);
  assertRequiredField("payerEmail", payload.payerEmail);
  assertRequiredField("successUrl", payload.successUrl);
  assertRequiredField("failureUrl", payload.failureUrl);
  assertRequiredField("pendingUrl", payload.pendingUrl);

  return payload;
}

export async function createMercadoPagoPreference(payload: MercadoPagoPreferencePayload) {
  if (!MP_CREATE_PREFERENCE_URL) {
    throw new Error("No está configurado el endpoint de Mercado Pago.");
  }

  console.log("Mercado Pago endpoint:", MP_CREATE_PREFERENCE_URL);
  console.log("MP payload final", JSON.stringify(payload, null, 2));

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
