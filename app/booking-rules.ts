import type { Booking } from "./types/booking";

const CONFIRMED_STATUSES = new Set(["paid", "booked", "cash_paid"]);
const REVIEWABLE_STATUSES = new Set(["paid", "booked", "cash_paid", "done"]);
const ACTIVE_STATUSES = new Set(["paid", "booked", "cash_pending", "cash_paid", "pending_payment"]);

const DAY_ALIASES: Record<string, number> = {
  domingo: 0,
  dom: 0,
  sunday: 0,
  lunes: 1,
  lun: 1,
  monday: 1,
  martes: 2,
  mar: 2,
  tuesday: 2,
  miercoles: 3,
  miércoles: 3,
  mie: 3,
  mié: 3,
  wednesday: 3,
  jueves: 4,
  jue: 4,
  thursday: 4,
  viernes: 5,
  vie: 5,
  friday: 5,
  sabado: 6,
  sábado: 6,
  sab: 6,
  sáb: 6,
  saturday: 6,
};

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

export function toBookingMillis(value: Booking["endAt"] | Booking["startAt"]) {
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

function parseTime(value?: string) {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return undefined;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return undefined;

  return { hours, minutes };
}

function parseSlotWeekday(day?: string) {
  if (!day) return undefined;

  const numericDay = Number(day);
  if (Number.isInteger(numericDay)) {
    if (numericDay >= 0 && numericDay <= 6) return numericDay;
    if (numericDay >= 1 && numericDay <= 7) return numericDay === 7 ? 0 : numericDay;
  }

  return DAY_ALIASES[normalize(day)];
}

export function getBookingEndMillis(booking: Pick<Booking, "day" | "startTime" | "endTime" | "endAt">, now = Date.now()) {
  const explicitEndAt = toBookingMillis(booking.endAt);
  if (explicitEndAt !== undefined) return explicitEndAt;

  const endTime = parseTime(booking.endTime || booking.startTime);
  if (!endTime) return undefined;

  const weekday = parseSlotWeekday(booking.day);
  const base = new Date(now);
  const candidate = new Date(base);

  if (weekday !== undefined) {
    const daysUntilSlot = (weekday - base.getDay() + 7) % 7;
    candidate.setDate(base.getDate() + daysUntilSlot);
  }

  candidate.setHours(endTime.hours, endTime.minutes, 0, 0);

  const startTime = parseTime(booking.startTime);
  if (startTime && (endTime.hours < startTime.hours || (endTime.hours === startTime.hours && endTime.minutes <= startTime.minutes))) {
    candidate.setDate(candidate.getDate() + 1);
  }

  if (candidate.getTime() <= now && weekday !== undefined) candidate.setDate(candidate.getDate() + 7);

  return candidate.getTime();
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

  const endAt = getBookingEndMillis(booking, now);
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
