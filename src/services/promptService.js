import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getDayId, getEndOfDay } from '../utils/dateHelpers';

// Fetches the most recent active prompt for the relationship.
// Looks for the latest dailyPrompt with status "active", or the most recent one overall.
export async function getCurrentDayPrompt(relationshipId) {
  // First try to find an active round
  const activeQuery = query(
    collection(db, 'dailyPrompts'),
    where('relationshipId', '==', relationshipId),
    where('status', '==', 'active'),
    orderBy('startDate', 'desc'),
    limit(1)
  );
  let snapshot = await getDocs(activeQuery);

  // If no active round, get the most recent one (might be revealed)
  if (snapshot.empty) {
    const latestQuery = query(
      collection(db, 'dailyPrompts'),
      where('relationshipId', '==', relationshipId),
      orderBy('startDate', 'desc'),
      limit(1)
    );
    snapshot = await getDocs(latestQuery);
  }

  if (snapshot.empty) return null;

  const dayDoc = snapshot.docs[0];
  const dayData = { id: dayDoc.id, ...dayDoc.data() };

  const promptDoc = await getDoc(doc(db, 'prompts', dayData.promptId));
  const promptData = promptDoc.exists() ? promptDoc.data() : null;

  return { ...dayData, prompt: promptData };
}

// Manually starts a new day by picking the next unused prompt.
// Uses a simple incrementing day number (day-1, day-2, etc.) so you can
// advance multiple times in the same calendar day for testing.
export async function advanceToNextDay(relationshipId) {
  // Find the highest existing day number to determine the next one
  const existingDays = await getDocs(
    query(
      collection(db, 'dailyPrompts'),
      where('relationshipId', '==', relationshipId)
    )
  );

  let nextDay = 1;
  existingDays.forEach((dayDoc) => {
    const data = dayDoc.data();
    // Extract day number from dayId like "day-3"
    const match = data.dayId?.match(/day-(\d+)/);
    if (match) {
      nextDay = Math.max(nextDay, parseInt(match[1]) + 1);
    }
  });

  const dayId = `day-${nextDay}`;
  const dayDocId = `${dayId}-${relationshipId}`;

  // Get the next prompt in sequence that hasn't been used
  const q = query(
    collection(db, 'prompts'),
    where('used', '==', false),
    orderBy('order'),
    limit(1)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('All prompts have been used! More coming soon.');
  }

  const promptDoc = snapshot.docs[0];

  // Create the daily prompt document
  await setDoc(doc(db, 'dailyPrompts', dayDocId), {
    relationshipId,
    promptId: promptDoc.id,
    dayId,
    startDate: serverTimestamp(),
    endDate: Timestamp.fromDate(getEndOfDay()),
    status: 'active',
    submissions: {},
    reactions: {},
  });

  // Mark prompt as used so it's not picked again
  await updateDoc(doc(db, 'prompts', promptDoc.id), { used: true });

  return { dayId, promptId: promptDoc.id };
}

// Toggles an emoji reaction on a day — adds if not present, removes if already there
export async function addReaction(relationshipId, dayId, userId, emoji, remove = false) {
  const dayDocId = `${dayId}-${relationshipId}`;
  const ref = doc(db, 'dailyPrompts', dayDocId);
  try {
    await updateDoc(ref, {
      [`reactions.${userId}.emojis`]: remove ? arrayRemove(emoji) : arrayUnion(emoji),
    });
  } catch (err) {
    // If reactions field doesn't exist yet, set it
    if (err.code === 'not-found') {
      await setDoc(ref, {
        reactions: { [userId]: { emojis: remove ? [] : [emoji] } },
      }, { merge: true });
    } else {
      throw err;
    }
  }
}

// Adds a text comment to a day's comments array
export async function addComment(relationshipId, dayId, userId, comment) {
  const dayDocId = `${dayId}-${relationshipId}`;
  const ref = doc(db, 'dailyPrompts', dayDocId);
  const entry = { userId, text: comment, createdAt: new Date().toISOString() };
  try {
    await updateDoc(ref, {
      comments: arrayUnion(entry),
    });
  } catch (err) {
    if (err.code === 'not-found') {
      await setDoc(ref, { comments: [entry] }, { merge: true });
    } else {
      throw err;
    }
  }
}

// Marks a day as "revealed" — both partners can now see each other's photos.
export async function markAsRevealed(relationshipId, dayId) {
  const dayDocId = `${dayId}-${relationshipId}`;
  await updateDoc(doc(db, 'dailyPrompts', dayDocId), {
    status: 'revealed',
    revealedAt: serverTimestamp(),
  });
}

// Fetches all past days for the gallery, most recent first.
// Includes prompt details for each day so we can show titles in the grid.
export async function getAllDays(relationshipId) {
  const q = query(
    collection(db, 'dailyPrompts'),
    where('relationshipId', '==', relationshipId),
    orderBy('startDate', 'desc')
  );
  const snapshot = await getDocs(q);

  const days = [];
  for (const dayDoc of snapshot.docs) {
    const data = dayDoc.data();
    const promptDoc = await getDoc(doc(db, 'prompts', data.promptId));
    days.push({
      id: dayDoc.id,
      ...data,
      prompt: promptDoc.exists() ? promptDoc.data() : null,
    });
  }

  return days;
}

// Fetches full details for a single day (used by RevealScreen)
export async function getDayDetails(relationshipId, dayId) {
  const dayDocId = `${dayId}-${relationshipId}`;
  const dayDoc = await getDoc(doc(db, 'dailyPrompts', dayDocId));

  if (!dayDoc.exists()) return null;

  const data = dayDoc.data();
  const promptDoc = await getDoc(doc(db, 'prompts', data.promptId));

  return {
    id: dayDoc.id,
    ...data,
    prompt: promptDoc.exists() ? promptDoc.data() : null,
  };
}
