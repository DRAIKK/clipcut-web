import type { Booking } from "./types/booking";

const CONFIRMED_STATUSES = new Set(["paid", "booked", "cash_paid"]);
const REVIEWABLE_STATUSES = new Set(["paid", "booked", "cash_paid", "done"]);
const ACTIVE_STATUSES = new Set(["paid", "booked", "cash_pending", "cash_paid", "pending_payment"]);

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function toMillis(value: Booking["endAt"]) {
  if (!value) return undefined;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  const timestampValue = value as { seconds?: number; toMillis?: () => number };
  if (typeof timestampValue.toMillis === "function") return timestampValue.toMillis();
  if (typeof timestampValue.seconds === "number") return timestampValue.seconds * 1000;

  return undefined;
}

export function isConfirmedBooking(booking: Booking) {
  return CONFIRMED_STATUSES.has(normalize(booking.status));
}

export function isReviewableBooking(booking: Booking) {
  return REVIEWABLE_STATUSES.has(normalize(booking.status));
}

export function isPendingCashRequest(booking: Booking) {
  return normalize(booking.status) === "cash_pending";
}

export function isPendingPaymentBooking(booking: Booking) {
  return normalize(booking.status) === "pending_payment";
}

export function isCanceledBooking(booking: Booking) {
  const status = normalize(booking.status);
  return status === "canceled" || status === "cancelled" || status === "cash_rejected";
}

export function isActiveBlockingBooking(booking: Booking, now = Date.now()) {
  if (!ACTIVE_STATUSES.has(normalize(booking.status))) return false;

  const endAt = toMillis(booking.endAt);
  if (endAt !== undefined) return endAt > now;

  return true;
}

export function getBookingStatusLabel(booking: Booking) {
  const status = normalize(booking.status);

  if (status === "paid") return "Pagada";
  if (status === "booked") return "Confirmada";
  if (status === "cash_paid") return "Confirmada";
  if (status === "cash_pending") return "Esperando confirmación";
  if (status === "pending_payment") return "Pago pendiente";
  if (status === "cash_rejected") return "Rechazada";
  if (status === "canceled" || status === "cancelled") return "Cancelada";
  if (status === "done") return "Realizada";

  return booking.status || "Estado no disponible";
}
