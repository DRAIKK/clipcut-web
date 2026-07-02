import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
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

    await db.runTransaction(async (transaction) => {
      const slotSnapshot = await transaction.get(slotRef);

      if (slotSnapshot.exists) {
        const slotData = slotSnapshot.data() ?? {};
        if (slotData.bookedBy || slotData.bookedBookingId || slotData.booked === true || slotData.available === false) {
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
        day: asString(body.day),
        startTime: asString(body.startTime),
        endTime: asString(body.endTime),
        paymentMethod,
        status: paymentMethod === "cash" ? "cash_pending" : "pending_payment",
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
