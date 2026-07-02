export const MP_CREATE_PREFERENCE_URL = process.env.NEXT_PUBLIC_MP_CREATE_PREFERENCE_URL ?? "https://us-central1-clipcut-3053d.cloudfunctions.net/api/mp/create-preference";

export type MercadoPagoPreferencePayload = {
  barberId: string;
  bookingId: string;
  title: string;
  paymentType: "mp" | "deposit";
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
};

type MercadoPagoPreferenceResponse = {
  init_point?: string;
  sandbox_init_point?: string;
};

function hasValue(value: string) {
  return value.trim().length > 0;
}

function assertRequiredField(fieldName: keyof MercadoPagoPreferencePayload, value: string) {
  if (!hasValue(value)) {
    throw new Error(`Falta ${fieldName} para iniciar Mercado Pago.`);
  }
}

export function buildMercadoPagoPreferencePayload(payload: MercadoPagoPreferencePayload): MercadoPagoPreferencePayload {
  assertRequiredField("barberId", payload.barberId);
  assertRequiredField("bookingId", payload.bookingId);
  assertRequiredField("title", payload.title);
  assertRequiredField("paymentType", payload.paymentType);
  assertRequiredField("successUrl", payload.successUrl);
  assertRequiredField("failureUrl", payload.failureUrl);
  assertRequiredField("pendingUrl", payload.pendingUrl);

  return payload;
}

export async function createMercadoPagoPreference(payload: MercadoPagoPreferencePayload) {
  if (!MP_CREATE_PREFERENCE_URL) {
    throw new Error("No está configurado el endpoint de Mercado Pago.");
  }

  const response = await fetch(MP_CREATE_PREFERENCE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildMercadoPagoPreferencePayload(payload)),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("MP error body", errorBody);
    throw new Error(errorBody || "No se pudo iniciar Mercado Pago. Probá nuevamente.");
  }

  return (await response.json()) as MercadoPagoPreferenceResponse;
}
