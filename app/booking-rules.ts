import type { Booking } from "./types/booking";

const CONFIRMED_STATUSES = new Set(["paid", "booked", "cash_paid"]);
const REVIEWABLE_STATUSES = new Set(["paid", "booked", "cash_paid", "done", "completed", "complete", "finished"]);
const ACTIVE_STATUSES = new Set(["paid", "booked", "pending", "cash_pending", "cash_paid", "pending_payment"]);

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

type BookingDateValue = Booking["endAt"] | Booking["startAt"] | Booking["bookingDate"] | Booking["date"] | Booking["createdAt"];

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

export function toBookingMillis(value: BookingDateValue) {
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

function getExplicitBookingDateMillis(booking: Pick<Booking, "bookingDate" | "date" | "startAt" | "createdAt">) {
  return toBookingMillis(booking.bookingDate) ?? toBookingMillis(booking.date) ?? toBookingMillis(booking.startAt);
}

function endMillisFromDateAndTime(dateMillis: number, endTime: { hours: number; minutes: number }, startTime?: { hours: number; minutes: number }) {
  const candidate = new Date(dateMillis);
  candidate.setHours(endTime.hours, endTime.minutes, 0, 0);

  if (startTime && (endTime.hours < startTime.hours || (endTime.hours === startTime.hours && endTime.minutes <= startTime.minutes))) {
    candidate.setDate(candidate.getDate() + 1);
  }

  return candidate.getTime();
}

export function getBookingEndMillis(
  booking: Pick<Booking, "day" | "startTime" | "endTime" | "endAt" | "startAt" | "bookingDate" | "date" | "createdAt">,
  now = Date.now(),
) {
  const explicitEndAt = toBookingMillis(booking.endAt);
  if (explicitEndAt !== undefined) return explicitEndAt;

  const endTime = parseTime(booking.endTime || booking.startTime);
  if (!endTime) return undefined;

  const startTime = parseTime(booking.startTime);
  const explicitBookingDate = getExplicitBookingDateMillis(booking);
  if (explicitBookingDate !== undefined) return endMillisFromDateAndTime(explicitBookingDate, endTime, startTime);

  const createdAt = toBookingMillis(booking.createdAt);
  const weekday = parseSlotWeekday(booking.day);
  if (createdAt !== undefined && weekday !== undefined) {
    const candidate = new Date(createdAt);
    candidate.setDate(candidate.getDate() + ((weekday - candidate.getDay() + 7) % 7));
    return endMillisFromDateAndTime(candidate.getTime(), endTime, startTime);
  }

  const candidate = new Date(now);
  if (weekday !== undefined) candidate.setDate(candidate.getDate() + ((weekday - candidate.getDay() + 7) % 7));
  return endMillisFromDateAndTime(candidate.getTime(), endTime, startTime);
}

export function isConfirmedBooking(booking: Booking) {
  return CONFIRMED_STATUSES.has(normalize(booking.status));
}

export function isReviewableBooking(booking: Booking) {
  return REVIEWABLE_STATUSES.has(normalize(booking.status));
}

export function isPendingCashRequest(booking: Booking) {
  const status = normalize(booking.status);
  const paymentMethod = normalize(booking.paymentMethod);
  return status === "cash_pending" || (status === "pending" && paymentMethod === "cash");
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

export function isVisibleUpcomingBooking(booking: Booking, now = Date.now()) {
  if (isCanceledBooking(booking)) return false;

  const endAt = getBookingEndMillis(booking, now);
  if (endAt === undefined) return false;

  return endAt > now;
}

export function getBookingStatusLabel(booking: Booking) {
  const status = normalize(booking.status);

  if (status === "paid") return "Pagada";
  if (status === "booked") return "Confirmada";
  if (status === "cash_paid") return "Confirmada";
  if (status === "cash_pending" || (status === "pending" && normalize(booking.paymentMethod) === "cash")) {
    return "Esperando confirmación";
  }
  if (status === "pending_payment") return "Pago pendiente";
  if (status === "cash_rejected") return "Rechazada";
  if (status === "canceled" || status === "cancelled") return "Cancelada";
  if (status === "done") return "Realizada";

  return booking.status || "Estado no disponible";
}
