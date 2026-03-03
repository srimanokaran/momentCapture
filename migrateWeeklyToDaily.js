// One-time migration: copies all weeklyPrompts docs to dailyPrompts,
// remapping weekId → dayId. Safe to run multiple times (overwrites existing docs).

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrate() {
  const snapshot = await db.collection('weeklyPrompts').get();

  if (snapshot.empty) {
    console.log('No weeklyPrompts documents found.');
    return;
  }

  console.log(`Found ${snapshot.size} weeklyPrompts documents. Migrating...`);

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Remap weekId → dayId in the document data
    const { weekId, ...rest } = data;
    const dayId = weekId ? weekId.replace('round-', 'day-') : doc.id;

    // Build new doc ID: replace the weekId prefix in the doc ID
    const newDocId = doc.id.replace(weekId, dayId);

    await db.collection('dailyPrompts').doc(newDocId).set({
      ...rest,
      dayId,
    });

    console.log(`  ${doc.id} → ${newDocId}`);
  }

  console.log('Migration complete!');
}

migrate().catch(console.error);
