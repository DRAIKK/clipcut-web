import { httpsCallable } from "firebase/functions";
import type { Barber, Booking, PaymentMethodId, Service, TimeSlot } from "../app/types/booking";
import { functions } from "./firebase";

type CreateBookingInput = {
  barber: Barber;
  clientId: string;
  paymentMethod: PaymentMethodId;
  service: Service;
  slot: TimeSlot;
};

type BookingFunctionResponse = {
  booking?: Partial<Booking> & { id?: string };
  bookingId?: string;
  id?: string;
  status?: string;
};

function parsePrice(price: string) {
  const normalized = price.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : price;
}

export function buildBookingPayload({ barber, clientId, paymentMethod, service, slot }: CreateBookingInput) {
  if (!clientId) throw new Error("Iniciá sesión para reservar.");
  if (!barber.id || !service.id || !slot.id || !paymentMethod) {
    throw new Error("Elegí servicio, horario y método de pago para continuar.");
  }

  return {
    clientId,
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
  };
}

function responseToBooking(payload: ReturnType<typeof buildBookingPayload>, response: BookingFunctionResponse): Booking {
  const booking = response.booking ?? {};
  const id = booking.id ?? response.bookingId ?? response.id;

  if (!id) throw new Error("La reserva fue creada, pero no recibimos el ID de la reserva.");

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
    status: booking.status ?? response.status ?? (payload.paymentMethod === "cash" ? "cash_pending" : "pending_payment"),
    paymentMethod: payload.paymentMethod,
  };
}

export async function createBooking(input: CreateBookingInput) {
  if (!functions) throw new Error("Firebase Functions no está configurado.");

  const payload = buildBookingPayload(input);
  const callable = httpsCallable<typeof payload, BookingFunctionResponse>(functions, "createBooking");
  const result = await callable(payload);

  return responseToBooking(payload, result.data);
}
