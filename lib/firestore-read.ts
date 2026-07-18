import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { isActiveBlockingBooking } from "../app/booking-rules";
import type { Barber, Booking, PaymentMethod, Service, TimeSlot } from "../app/types/booking";
import type { Coordinates } from "./distance";
import { db } from "./firebase";

type FirestoreRecord = Record<string, unknown>;

const gradients = [
  "from-emerald-400 via-green-600 to-zinc-950",
  "from-lime-300 via-emerald-500 to-green-900",
  "from-green-300 via-teal-600 to-zinc-900",
  "from-emerald-200 via-green-500 to-black",
];

function hasValue(value: unknown) {
  if (typeof value === "string") return value.trim() !== "";
  return value !== undefined && value !== null && value !== "";
}

function isTrue(value: unknown) {
  return value === true || (typeof value === "string" && value.trim().toLowerCase() === "true");
}

function isFalse(value: unknown) {
  return value === false || (typeof value === "string" && value.trim().toLowerCase() === "false");
}

function getString(data: FirestoreRecord, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }

  return fallback;
}

function getNumber(data: FirestoreRecord, keys: string[], fallback: number) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return fallback;
}

function getRecord(value: unknown): FirestoreRecord | undefined {
  return typeof value === "object" && value !== null ? (value as FirestoreRecord) : undefined;
}

function getCoordinates(data: FirestoreRecord): Coordinates | undefined {
  const coordinateSources = [
    data,
    getRecord(data.location),
    getRecord(data.coords),
    getRecord(data.coordinates),
    getRecord(data.geo),
    getRecord(data.geoPoint),
    getRecord(data.geopoint),
  ].filter((source): source is FirestoreRecord => Boolean(source));

  for (const source of coordinateSources) {
    const latitude = getNumber(source, ["lat", "latitude", "_lat"], Number.NaN);
    const longitude = getNumber(source, ["lng", "longitude", "lon", "_long"], Number.NaN);

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) return { latitude, longitude };
  }

  return undefined;
}

function isPaymentEnabled(value: unknown) {
  if (value === true) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "active", "enabled", "habilitado", "si", "sí"].includes(normalized);
  }
  if (typeof value === "object" && value !== null) {
    const record = value as FirestoreRecord;
    return isPaymentEnabled(record.active ?? record.enabled ?? record.isActive ?? record.available);
  }

  return false;
}

function candidateIncludes(candidate: unknown, names: string[]) {
  if (Array.isArray(candidate)) {
    return candidate.some((item) => {
      if (typeof item === "string") return names.includes(item.trim().toLowerCase());
      if (typeof item !== "object" || item === null) return false;
      const record = item as FirestoreRecord;
      const id = getString(record, ["id", "type", "name", "key", "label"], "").trim().toLowerCase();
      return names.includes(id) && isPaymentEnabled(record.active ?? record.enabled ?? record.isActive ?? true);
    });
  }

  if (typeof candidate !== "object" || candidate === null) return false;
  const record = candidate as FirestoreRecord;
  return names.some((name) => isPaymentEnabled(record[name]));
}

function getPaymentMethods(data: FirestoreRecord): PaymentMethod[] {
  const methods: PaymentMethod[] = [];
  const candidates = [data.paymentMethods, data.payments, data.payment, data.metodosPago, data.paymentOptions];

  const hasTransfer =
    isPaymentEnabled(data.transfer) ||
    isPaymentEnabled(data.transferencia) ||
    isPaymentEnabled(data.bankTransfer) ||
    isPaymentEnabled(data.mercadoPago) ||
    candidates.some((candidate) => candidateIncludes(candidate, ["transfer", "transferencia", "banktransfer", "mercadopago"]));

  const hasDeposit =
    isPaymentEnabled(data.deposit) ||
    isPaymentEnabled(data.senia) ||
    isPaymentEnabled(data.seña) ||
    isPaymentEnabled(data.depositEnabled) ||
    candidates.some((candidate) => candidateIncludes(candidate, ["deposit", "senia", "seña", "deposito", "depósito"]));

  const hasCash =
    isPaymentEnabled(data.cash) ||
    isPaymentEnabled(data.efectivo) ||
    candidates.some((candidate) => candidateIncludes(candidate, ["cash", "efectivo"]));

  if (hasTransfer) methods.push({ id: "transfer", label: "Transferencia" });
  if (hasDeposit) methods.push({ id: "deposit", label: "Seña" });
  if (hasCash) methods.push({ id: "cash", label: "Efectivo" });

  return methods;
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "CC";
}

function isBarber(data: FirestoreRecord) {
  return data.role === "barber" || data.userType === "barber" || data.accountType === "barber";
}

function adaptBarber(id: string, data: FirestoreRecord, index = 0): Barber {
  const name = getString(
    data,
    ["fullName", "name", "displayName", "username", "barberName"],
    "Peluquero Clipcut"
  );

  const coordinates = getCoordinates(data);

  return {
    id,
    name,
    description: getString(
      data,
      ["description", "bio", "about", "barberDescription", "summary"],
      "Este peluquero todavía no agregó una descripción."
    ),
    followers: getString(data, ["followers", "followersCount", "followerCount"], "0"),
    address: getString(
      data,
      [
        "address",
        "locationText",
        "formattedAddress",
        "businessAddress",
        "addressText",
        "location",
        "street",
        "shopAddress",
      ],
      "Ubicación no configurada."
    ),
    rating: getNumber(data, ["ratingAvg", "ratingAverage", "rating", "score", "averageRating"], 5),
    ratingCount: getNumber(data, ["ratingCount", "reviewsCount", "reviewCount"], 0),
    imageGradient: gradients[index % gradients.length],
    distance: getString(data, ["distance", "distanceLabel"], ""),
    coordinates,
    location: coordinates,
    initials: getInitials(name),
    photoUrl: getString(
      data,
      ["photoURL", "avatarUrl", "profilePhoto", "profileImage", "imageUrl", "photo", "photoUrl", "avatar", "image"],
      ""
    ),
    paymentMethods: getPaymentMethods(data),
  };
}

function formatPrice(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return `$${value.toLocaleString("es-AR")}`;
  if (typeof value === "string" && value.trim()) {
    const trimmed = value.trim();
    return trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
  }

  return "Precio a consultar";
}

function adaptService(id: string, data: FirestoreRecord): Service | null {
  const name = getString(data, ["name", "title", "serviceName", "nombre"], "");
  if (!name) return null;

  const duration = getString(data, ["duration", "minutes", "serviceDuration"], "");

  return {
    id,
    name,
    duration,
    price: formatPrice(data.price ?? data.amount ?? data.servicePrice ?? data.precio),
    description: "",
  };
}

function getSlotLabel(startTime: string, endTime: string, label: string) {
  if (startTime && endTime && startTime !== endTime) return `${startTime} - ${endTime}`;
  if (startTime) return startTime;
  if (endTime) return endTime;
  return label;
}

function adaptSlot(id: string, data: FirestoreRecord, activeBookedSlotIds = new Set<string>()): TimeSlot | null {
  const status = getString(data, ["status"], "").trim().toLowerCase();
  const isSlotBlockedByActiveBooking = activeBookedSlotIds.has(id);
  const isManuallyUnavailable = status === "booked" || isTrue(data.booked) || isFalse(data.available);
  const isAvailable = !isSlotBlockedByActiveBooking && (!hasValue(data.bookedBy) || !isManuallyUnavailable);


  const day = getString(data, ["day", "dayLabel", "weekday", "dayName"], "");
  const startTime = getString(data, ["startTime", "start", "time"], "");
  const endTime = getString(data, ["endTime", "end"], "");
  const rawLabel = getString(data, ["label"], "");
  const label = getSlotLabel(startTime, endTime, rawLabel);

  if (!label) return null;

  return {
    id,
    label,
    available: isAvailable,
    day,
    startTime,
    endTime,
  };
}

export async function getBarbers(): Promise<Barber[]> {
  if (!db) throw new Error("Firebase no está configurado.");

  const snapshot = await getDocs(query(collection(db, "users")));

  return snapshot.docs
    .map((userDoc, index) => ({ userDoc, index }))
    .filter(({ userDoc }) => isBarber(userDoc.data()))
    .map(({ userDoc, index }) => adaptBarber(userDoc.id, userDoc.data(), index));
}

export async function getBarberById(barberId: string): Promise<Barber> {
  if (!db) throw new Error("Firebase no está configurado.");

  const snapshot = await getDoc(doc(db, "users", barberId));
  if (!snapshot.exists()) throw new Error("No se encontró el peluquero en Firestore.");

  const data = snapshot.data();
  console.log("barber real data", data);

  return adaptBarber(snapshot.id, data);
}

export async function getBarberSlots(barberId: string): Promise<TimeSlot[]> {
  if (!db) throw new Error("Firebase no está configurado.");

  const [slotsSnapshot, bookingsSnapshot] = await Promise.all([
    getDocs(query(collection(db, "users", barberId, "slots"))),
    getDocs(query(collection(db, "bookings"), where("barberId", "==", barberId))),
  ]);
  const activeBookedSlotIds = new Set(
    bookingsSnapshot.docs
      .map((bookingDoc) => adaptBooking(bookingDoc.id, bookingDoc.data()))
      .filter((booking) => isActiveBlockingBooking(booking))
      .map((booking) => booking.slotId)
      .filter((slotId): slotId is string => Boolean(slotId)),
  );

  return slotsSnapshot.docs
    .map((slotDoc) => adaptSlot(slotDoc.id, slotDoc.data(), activeBookedSlotIds))
    .filter((slot): slot is TimeSlot => Boolean(slot));
}


export async function getBarberServices(barberId: string): Promise<Service[]> {
  if (!db) throw new Error("Firebase no está configurado.");

  const servicesSnapshot = await getDocs(query(collection(db, "users", barberId, "services")));
  const services = servicesSnapshot.docs
    .map((serviceDoc) => adaptService(serviceDoc.id, serviceDoc.data()))
    .filter((service): service is Service => Boolean(service));

  if (services.length > 0) return services;

  const serviciosSnapshot = await getDocs(query(collection(db, "users", barberId, "servicios")));

  return serviciosSnapshot.docs
    .map((serviceDoc) => adaptService(serviceDoc.id, serviceDoc.data()))
    .filter((service): service is Service => Boolean(service));
}


function adaptBooking(id: string, data: FirestoreRecord): Booking {
  const serviceName = getString(data, ["serviceName", "service", "serviceTitle"], "Reserva Clipcut");
  const startTime = getString(data, ["startTime", "start", "time"], "");
  const endTime = getString(data, ["endTime", "end"], "");
  const day = getString(data, ["day", "date", "dayLabel"], "");

  return {
    id,
    barberId: getString(data, ["barberId", "professionalId"], ""),
    barberName: getString(data, ["barberName", "professionalName"], ""),
    serviceId: getString(data, ["serviceId"], ""),
    serviceName,
    servicePrice: data.servicePrice as number | string | undefined,
    slotId: getString(data, ["slotId"], ""),
    day,
    startTime,
    endTime,
    dateTime: [day, startTime && endTime ? `${startTime} - ${endTime}` : startTime].filter(Boolean).join(" · "),
    address: getString(data, ["address", "barberAddress"], ""),
    status: getString(data, ["status"], ""),
    paymentMethod: getString(data, ["paymentMethod"], ""),
    startAt: data.startAt as Booking["startAt"],
    endAt: data.endAt as Booking["endAt"],
    bookingDate: data.bookingDate as Booking["bookingDate"],
    date: data.date as Booking["date"],
    createdAt: data.createdAt as Booking["createdAt"],
  };
}

export async function getClientBookings(clientId: string): Promise<Booking[]> {
  if (!db) throw new Error("Firebase no está configurado.");

  const snapshot = await getDocs(query(collection(db, "bookings"), where("clientId", "==", clientId)));

  return snapshot.docs.map((bookingDoc) => adaptBooking(bookingDoc.id, bookingDoc.data()));
}
