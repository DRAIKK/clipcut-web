import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import type { DocumentData } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";

initializeApp();

const db = getFirestore();
const allowedOrigins = new Set(["https://clipcut-web.vercel.app", "http://localhost:3000", "http://localhost:3001"]);

type BookingPayload = {
  barberId?: unknown;
  clientId?: unknown;
  barberName?: unknown;
  clientName?: unknown;
  clientEmail?: unknown;
  barberAddress?: unknown;
  serviceId?: unknown;
  serviceName?: unknown;
  servicePrice?: unknown;
  slotId?: unknown;
  day?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  paymentMethod?: unknown;
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asPositiveNumber(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}


const ACTIVE_STATUSES = new Set(["paid", "booked", "pending", "cash_pending", "cash_paid", "pending_payment"]);
const DAY_ALIASES: Record<string, number> = {
  domingo: 0, dom: 0, lunes: 1, lun: 1, martes: 2, mar: 2, miercoles: 3, "miércoles": 3, mie: 3, "mié": 3, jueves: 4, jue: 4, viernes: 5, vie: 5, sabado: 6, "sábado": 6, sab: 6, "sáb": 6,
};

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function toMillis(value: unknown) {
  if (!value) return undefined;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  if (typeof value === "object") {
    const timestamp = value as { seconds?: number; toMillis?: () => number };
    if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
    if (typeof timestamp.seconds === "number") return timestamp.seconds * 1000;
  }
  return undefined;
}

function parseTime(value?: string) {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return undefined;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 ? { hours, minutes } : undefined;
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

function getExplicitBookingDateMillis(data: DocumentData) {
  return toMillis(data.bookingDate) ?? toMillis(data.date);
}

function endMillisFromDateAndTime(dateMillis: number, endTime: { hours: number; minutes: number }, startTime?: { hours: number; minutes: number }) {
  const candidate = new Date(dateMillis);
  candidate.setHours(endTime.hours, endTime.minutes, 0, 0);
  if (startTime && (endTime.hours < startTime.hours || (endTime.hours === startTime.hours && endTime.minutes <= startTime.minutes))) candidate.setDate(candidate.getDate() + 1);
  return candidate.getTime();
}

function getBookingEndMillis(data: DocumentData, now = Date.now()) {
  const explicitEndAt = toMillis(data.endAt);
  if (explicitEndAt !== undefined) return explicitEndAt;
  const endTime = parseTime(asString(data.endTime) || asString(data.startTime));
  if (!endTime) return undefined;
  const startTime = parseTime(asString(data.startTime));
  const startAt = toMillis(data.startAt);
  if (startAt !== undefined) return endMillisFromDateAndTime(startAt, endTime, startTime);
  const explicitBookingDate = getExplicitBookingDateMillis(data);
  if (explicitBookingDate !== undefined) return endMillisFromDateAndTime(explicitBookingDate, endTime, startTime);
  const weekday = parseSlotWeekday(asString(data.day));
  const candidate = new Date(now);
  if (weekday !== undefined) candidate.setDate(candidate.getDate() + ((weekday - candidate.getDay() + 7) % 7));
  return endMillisFromDateAndTime(candidate.getTime(), endTime, startTime);
}

function isActiveBlockingBooking(data: DocumentData, now = Date.now()) {
  if (!ACTIVE_STATUSES.has(normalize(asString(data.status)))) return false;
  const endMillis = getBookingEndMillis(data, now);
  return endMillis === undefined || endMillis > now;
}

function getBookingDateRange(day: string, start: string, end: string, now = Date.now()) {
  const startTime = parseTime(start);
  const endTime = parseTime(end || start);
  if (!startTime || !endTime) return {};
  const weekday = parseSlotWeekday(day);
  const startAt = new Date(now);
  if (weekday !== undefined) startAt.setDate(startAt.getDate() + ((weekday - startAt.getDay() + 7) % 7));
  startAt.setHours(startTime.hours, startTime.minutes, 0, 0);
  if (weekday === startAt.getDay() && startAt.getTime() < now) startAt.setDate(startAt.getDate() + 7);
  const endAt = new Date(startAt);
  endAt.setHours(endTime.hours, endTime.minutes, 0, 0);
  if (endAt.getTime() <= startAt.getTime()) endAt.setDate(endAt.getDate() + 1);
  return { startAt, endAt };
}

function applyCors(req: { get(name: string): string | undefined }, res: { set(field: string, value: string): unknown }) {
  const origin = req.get("origin");
  if (origin && allowedOrigins.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export const api = onRequest({ region: "us-central1" }, async (req, res) => {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.path !== "/booking/create") {
    res.status(404).json({ error: "not_found" });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const body = (req.body ?? {}) as BookingPayload;
  const barberId = asString(body.barberId);
  const clientId = asString(body.clientId);
  const serviceName = asString(body.serviceName);
  const servicePrice = asPositiveNumber(body.servicePrice);
  const slotId = asString(body.slotId);
  const requestedPaymentMethod = asString(body.paymentMethod);
  const isDepositPayment =
    requestedPaymentMethod === "deposit" || requestedPaymentMethod === "seña" || requestedPaymentMethod === "senia";
  const paymentMethod =
    requestedPaymentMethod === "cash"
      ? "cash"
      : isDepositPayment
        ? "deposit"
        : requestedPaymentMethod === "mp" || requestedPaymentMethod === "transfer"
          ? "mp"
          : "";
  const missingFields: string[] = [];

  if (!barberId) missingFields.push("barberId");
  if (!clientId) missingFields.push("clientId");
  if (!serviceName) missingFields.push("serviceName");
  if (servicePrice <= 0) missingFields.push("servicePrice");
  if (!slotId) missingFields.push("slotId");
  if (!paymentMethod) missingFields.push("paymentMethod");

  if (missingFields.length > 0) {
    res.status(400).json({ error: "missing_required_fields", fields: missingFields });
    return;
  }

  try {
    const bookingRef = db.collection("bookings").doc();
    const slotRef = db.collection("users").doc(barberId).collection("slots").doc(slotId);
    const now = FieldValue.serverTimestamp();
    const day = asString(body.day);
    const startTime = asString(body.startTime);
    const endTime = asString(body.endTime);
    const bookingDateRange = getBookingDateRange(day, startTime, endTime);

    await db.runTransaction(async (transaction) => {
      const slotSnapshot = await transaction.get(slotRef);

      if (slotSnapshot.exists) {
        const slotData = slotSnapshot.data() ?? {};
        if (slotData.bookedBookingId) {
          const currentBooking = await transaction.get(db.collection("bookings").doc(String(slotData.bookedBookingId)));
          if (currentBooking.exists && isActiveBlockingBooking(currentBooking.data() ?? {})) throw new Error("slot_unavailable");
        } else if (slotData.bookedBy || slotData.booked === true || slotData.available === false) {
          throw new Error("slot_unavailable");
        }
      }

      transaction.set(bookingRef, {
        barberId,
        clientId,
        barberName: asString(body.barberName),
        clientName: asString(body.clientName),
        clientEmail: asString(body.clientEmail),
        barberAddress: asString(body.barberAddress),
        serviceId: asString(body.serviceId),
        serviceName,
        servicePrice,
        slotId,
        day,
        startTime,
        endTime,
        ...bookingDateRange,
        paymentMethod,
        status: paymentMethod === "cash" ? "pending" : "pending_payment",
        createdAt: now,
        updatedAt: now,
      });

      transaction.set(
        slotRef,
        {
          bookedBy: clientId,
          bookedAt: now,
          bookedBookingId: bookingRef.id,
          available: false,
        },
        { merge: true },
      );
    });

    res.status(200).json({ bookingId: bookingRef.id });
  } catch (error) {
    if (error instanceof Error && error.message === "slot_unavailable") {
      res.status(409).json({ error: "slot_unavailable" });
      return;
    }

    console.error("booking create error", error);
    res.status(500).json({ error: "internal" });
  }
});
