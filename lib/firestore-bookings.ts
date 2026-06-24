import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import type { Barber, PaymentMethodId, Service, TimeSlot } from "../app/types/booking";
import { db } from "./firebase";

type CreateBookingInput = {
  barber: Barber;
  clientId: string;
  paymentMethod: PaymentMethodId;
  service: Service;
  slot: TimeSlot;
};

function parsePrice(price: string) {
  const normalized = price.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : price;
}

function slotIsUnavailable(data: Record<string, unknown>) {
  const status = typeof data.status === "string" ? data.status.trim().toLowerCase() : "";

  return Boolean(data.bookedBy) || data.booked === true || data.available === false || status === "booked";
}

export async function createBooking({ barber, clientId, paymentMethod, service, slot }: CreateBookingInput) {
  if (!db) throw new Error("Firebase no está configurado.");
  if (!clientId) throw new Error("Iniciá sesión para reservar.");
  if (!barber.id || !service.id || !slot.id || !paymentMethod) {
    throw new Error("Elegí servicio, horario y método de pago para continuar.");
  }

  const freshSlot = await getDoc(doc(db, "users", barber.id, "slots", slot.id));
  if (!freshSlot.exists()) throw new Error("El horario seleccionado ya no está disponible.");
  if (slotIsUnavailable(freshSlot.data())) throw new Error("Ese horario ya fue reservado. Elegí otro turno.");

  const status = paymentMethod === "cash" ? "cash_pending" : "pending_payment";
  const bookingData = {
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
    status,
    paymentMethod,
    createdAt: serverTimestamp(),
  };

  const bookingRef = await addDoc(collection(db, "bookings"), bookingData);

  // TODO: Verificar en Clipcut App si el bloqueo del slot lo hace frontend o Cloud Functions antes de actualizar users/{barberId}/slots/{slotId} desde web.
  return { id: bookingRef.id, ...bookingData };
}
