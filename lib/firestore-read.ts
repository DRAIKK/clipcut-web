import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import type { Barber, TimeSlot } from "../app/types/booking";
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
    distance: getString(data, ["distance", "distanceLabel"], "Cerca tuyo"),
    initials: getInitials(name),
    photoUrl: getString(
      data,
      ["photoURL", "avatarUrl", "profilePhoto", "profileImage", "imageUrl", "photo", "photoUrl", "avatar", "image"],
      ""
    ),
  };
}

function getSlotLabel(day: string, startTime: string, endTime: string) {
  const timeLabel = startTime && endTime && startTime !== endTime ? `${startTime} - ${endTime}` : startTime || endTime;

  if (day && timeLabel) return `${day} · ${timeLabel}`;
  return day || timeLabel;
}

function adaptSlot(id: string, data: FirestoreRecord): TimeSlot | null {
  const status = getString(data, ["status"], "").trim().toLowerCase();
  const isAvailable =
    !hasValue(data.bookedBy) && status !== "booked" && !isTrue(data.booked) && !isFalse(data.available);

  if (!isAvailable) return null;

  const day = getString(data, ["day", "dayLabel", "weekday", "dayName"], "");
  const startTime = getString(data, ["startTime", "start", "time", "label"], "");
  const endTime = getString(data, ["endTime", "end"], "");
  const label = getSlotLabel(day, startTime, endTime);

  if (!label) return null;

  return {
    id,
    label,
    available: true,
    day,
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

  const snapshot = await getDocs(query(collection(db, "users", barberId, "slots")));
  const slots = snapshot.docs.map((slotDoc) => ({ id: slotDoc.id, ...slotDoc.data() }));
  console.log("slots real data", slots);

  return snapshot.docs
    .map((slotDoc) => adaptSlot(slotDoc.id, slotDoc.data()))
    .filter((slot): slot is TimeSlot => Boolean(slot));
}
