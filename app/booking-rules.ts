import type { Booking } from "./types/booking";

const CONFIRMED_STATUSES = new Set(["paid", "booked", "cash_paid"]);
const REVIEWABLE_STATUSES = new Set(["paid", "booked", "cash_paid", "done"]);

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

export function isConfirmedBooking(booking: Booking) {
  const status = normalize(booking.status);
  const paymentMethod = normalize(booking.paymentMethod);

  if (status === "cash_pending") return paymentMethod === "cash" || paymentMethod === "efectivo";
  return CONFIRMED_STATUSES.has(status);
}

export function isReviewableBooking(booking: Booking) {
  return REVIEWABLE_STATUSES.has(normalize(booking.status));
}

export function getBookingStatusLabel(booking: Booking) {
  const status = normalize(booking.status);

  if (status === "paid") return "Pagada";
  if (status === "booked") return "Confirmada";
  if (status === "cash_paid") return "Efectivo pagado";
  if (status === "cash_pending") return "Efectivo pendiente";
  if (status === "done") return "Realizada";

  return booking.status || "Estado no disponible";
}
