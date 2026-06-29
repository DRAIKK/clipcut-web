import type { buildBookingPayload } from "./firestore-bookings";

export const MP_CREATE_PREFERENCE_URL = process.env.NEXT_PUBLIC_MP_CREATE_PREFERENCE_URL;

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

export function buildMercadoPagoPreferencePayload({ booking, failureUrl, payerEmail, pendingUrl, successUrl }: MercadoPagoPreferenceInput): MercadoPagoPreferencePayload {
  return {
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
  };
}

export async function createMercadoPagoPreference(payload: MercadoPagoPreferencePayload) {
  if (!MP_CREATE_PREFERENCE_URL) {
    throw new Error("No está configurado el endpoint de Mercado Pago.");
  }

  console.log("Mercado Pago endpoint:", MP_CREATE_PREFERENCE_URL);
  console.log("MP payload enviado", payload);

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
