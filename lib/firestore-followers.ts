import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

function requireFirestore() {
  if (!db) throw new Error("Firebase no está configurado.");
  return db;
}

export async function isFollowingBarber(barberId: string, clientId: string) {
  const firestore = requireFirestore();
  const followerRef = doc(firestore, "users", barberId, "followers", clientId);
  const snapshot = await getDoc(followerRef);

  return snapshot.exists();
}

export async function followBarber(barberId: string, clientId: string) {
  const firestore = requireFirestore();
  const followerRef = doc(firestore, "users", barberId, "followers", clientId);
  await setDoc(followerRef, {
    clientId,
    followedAt: serverTimestamp(),
  });

  // followersCount should be maintained by a Cloud Function or another secure server-side rule.
  // Updating users/{barberId}.followersCount from the client can be rejected by Firestore Rules.
}

export async function unfollowBarber(barberId: string, clientId: string) {
  const firestore = requireFirestore();
  const followerRef = doc(firestore, "users", barberId, "followers", clientId);
  await deleteDoc(followerRef);

  // followersCount should be maintained by a Cloud Function or another secure server-side rule.
  // Updating users/{barberId}.followersCount from the client can be rejected by Firestore Rules.
}
