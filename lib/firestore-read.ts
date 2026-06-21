import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import { mockBarber, mockTimeSlots } from "../app/data/mockBooking";
import type { Barber, TimeSlot } from "../app/types/booking";
import { db } from "./firebase";

type FirestoreRecord = Record<string, unknown>;

const gradients = [
  "from-emerald-400 via-green-600 to-zinc-950",
  "from-lime-300 via-emerald-500 to-green-900",
  "from-green-300 via-teal-600 to-zinc-900",
  "from-emerald-200 via-green-500 to-black",
];

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
  const name = getString(data, ["name", "displayName", "fullName", "barberName"], "Peluquero Clipcut");

  return {
    id,
    name,
    description: getString(
      data,
      ["description", "bio", "about", "summary"],
      "Peluquero profesional disponible en Clipcut."
    ),
    followers: getString(data, ["followers", "followersCount", "followerCount"], "0"),
    address: getString(data, ["address", "location", "street", "shopAddress"], "Dirección no disponible"),
    rating: getNumber(data, ["rating", "score", "averageRating"], 5),
    imageGradient: gradients[index % gradients.length],
    distance: getString(data, ["distance", "distanceLabel"], "Cerca tuyo"),
    initials: getInitials(name),
    photoUrl: getString(data, ["photoUrl", "photoURL", "avatar", "image", "imageUrl"], ""),
  };
}

function adaptSlot(id: string, data: FirestoreRecord): TimeSlot | null {
  const bookedBy = data.bookedBy;
  const available = typeof data.available === "boolean" ? data.available : !bookedBy;

  if (!available) return null;

  const label = getString(data, ["label", "time", "startTime"], "");
  if (!label) return null;

  return {
    id,
    label,
    available: true,
    day: getString(data, ["day"], ""),
    endTime: getString(data, ["endTime"], ""),
  };
}

export async function getBarbers(): Promise<Barber[]> {
  if (!db) return [];

  const snapshot = await getDocs(query(collection(db, "users")));

  return snapshot.docs
    .map((userDoc, index) => ({ userDoc, index }))
    .filter(({ userDoc }) => isBarber(userDoc.data()))
    .map(({ userDoc, index }) => adaptBarber(userDoc.id, userDoc.data(), index));
}

export async function getBarberById(barberId: string): Promise<Barber> {
  if (!db) return mockBarber;

  const snapshot = await getDoc(doc(db, "users", barberId));
  if (!snapshot.exists()) return mockBarber;

  return adaptBarber(snapshot.id, snapshot.data());
}

export async function getBarberSlots(barberId: string): Promise<TimeSlot[]> {
  if (!db) return [];

  const snapshot = await getDocs(query(collection(db, "users", barberId, "slots")));
  const slots = snapshot.docs
    .map((slotDoc) => adaptSlot(slotDoc.id, slotDoc.data()))
    .filter((slot): slot is TimeSlot => Boolean(slot));

  return slots.length ? slots : mockTimeSlots;
}
