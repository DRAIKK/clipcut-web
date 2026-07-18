import type { PaymentMethodId } from "../app/types/booking";

export const CREATE_BOOKING_URL = process.env.NEXT_PUBLIC_CREATE_BOOKING_URL;

type BookingPaymentMethod = PaymentMethodId | "mp";

export type CreateBookingPayload = {
  barberId: string;
  barberName: string;
  barberAddress: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number | string;
  slotId: string;
  day: string;
  startTime: string;
  endTime: string;
  startAt: number;
  endAt: number;
  clientId: string;
  clientName: string;
  clientEmail: string;
  paymentMethod: BookingPaymentMethod;
};

type CreateBookingResponse = {
  bookingId: string;
};

export async function createBookingFromWeb(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
  const createBookingUrl = process.env.NEXT_PUBLIC_CREATE_BOOKING_URL;

  if (!createBookingUrl) {
    throw new Error("No está configurado NEXT_PUBLIC_CREATE_BOOKING_URL para crear reservas.");
  }

  const response = await fetch(createBookingUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "No se pudo crear la reserva. Probá nuevamente.");
  }

  const data = (await response.json()) as CreateBookingResponse;
  if (!data.bookingId) {
    throw new Error("El backend no devolvió el identificador de la reserva.");
  }

  return data;
}
