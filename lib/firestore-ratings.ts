import { doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "./firebase";

function assertRating(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error("La calificación debe ser un número entero entre 1 y 5.");
  }
}

function readNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

export async function getClientBarberRating(clientId: string, barberId: string) {
  if (!db) throw new Error("Firebase no está configurado.");

  const snapshot = await getDoc(doc(db, "users", barberId, "ratings", clientId));
  if (!snapshot.exists()) return undefined;

  const rating = readNumber(snapshot.data().rating, Number.NaN);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : undefined;
}

export async function saveClientBarberRating(clientId: string, barberId: string, rating: number) {
  if (!db) throw new Error("Firebase no está configurado.");

  assertRating(rating);

  const ratingRef = doc(db, "users", barberId, "ratings", clientId);
  const barberRef = doc(db, "users", barberId);

  await runTransaction(db, async (transaction) => {
    const [ratingSnapshot, barberSnapshot] = await Promise.all([
      transaction.get(ratingRef),
      transaction.get(barberRef),
    ]);

    if (ratingSnapshot.exists()) {
      throw new Error("Ya calificaste a este peluquero.");
    }
    if (!barberSnapshot.exists()) {
      throw new Error("No se encontró el peluquero.");
    }

    const barberData = barberSnapshot.data();
    const currentAverage = readNumber(barberData.ratingAvg ?? barberData.ratingAverage ?? barberData.rating, 0);
    const currentCount = Math.max(0, Math.trunc(readNumber(barberData.ratingCount ?? barberData.reviewsCount ?? barberData.reviewCount, 0)));
    const ratingCount = currentCount + 1;
    const ratingAvg = ((currentAverage * currentCount) + rating) / ratingCount;

    transaction.set(ratingRef, {
      barberId,
      clientId,
      rating,
      createdAt: new Date().toISOString(),
    });
    transaction.update(barberRef, { ratingAvg, ratingCount });
  });
}
