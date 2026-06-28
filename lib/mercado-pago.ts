import type { buildBookingPayload } from "./firestore-bookings";

export const MP_CREATE_PREFERENCE_URL = process.env.NEXT_PUBLIC_MP_CREATE_PREFERENCE_URL;

type BookingPayload = ReturnType<typeof buildBookingPayload>;

type MercadoPagoPreferenceResponse = {
  init_point?: string;
  sandbox_init_point?: string;
};

export async function createMercadoPagoPreference(payload: BookingPayload) {
  if (!MP_CREATE_PREFERENCE_URL) {
    throw new Error("No está configurado el endpoint de Mercado Pago.");
  }

  console.log(
    "Mercado Pago endpoint:",
    MP_CREATE_PREFERENCE_URL
  );

  const response = await fetch(MP_CREATE_PREFERENCE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "No se pudo iniciar Mercado Pago. Probá nuevamente.");
  }

  return (await response.json()) as MercadoPagoPreferenceResponse;
}
