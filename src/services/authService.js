import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// A single hardcoded relationship ID shared between you and your girlfriend.
// Since only two people use the app, we skip invite codes and auto-pair.
const RELATIONSHIP_ID = 'couple-main';

// Creates a new account and auto-links to the shared relationship.
// The first person to sign up creates the relationship doc;
// the second person gets added to it automatically.
export async function signUp(email, password, name) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const userId = credential.user.uid;

  // Save user profile to Firestore
  await setDoc(doc(db, 'users', userId), {
    name,
    email,
    relationshipId: RELATIONSHIP_ID,
    createdAt: serverTimestamp(),
  });

  // Create or update the shared relationship doc
  const relRef = doc(db, 'relationships', RELATIONSHIP_ID);
  const relDoc = await getDoc(relRef);

  if (!relDoc.exists()) {
    // First person signing up — create the relationship
    await setDoc(relRef, {
      users: [userId],
      createdAt: serverTimestamp(),
      currentStreak: 0,
      stats: { totalWeeksCompleted: 0 },
    });
  } else {
    // Second person signing up — add them to the existing relationship
    const data = relDoc.data();
    if (!data.users.includes(userId)) {
      await updateDoc(relRef, {
        users: [...data.users, userId],
      });
    }
  }

  return credential.user;
}

// Logs in with email/password
export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// Signs out the current user
export async function logout() {
  await signOut(auth);
}

// Fetches the user's Firestore profile
export async function getUserData(userId) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() };
}

// Exports the shared relationship ID so other services can use it
export { RELATIONSHIP_ID };
