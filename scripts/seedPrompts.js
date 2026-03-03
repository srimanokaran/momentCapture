// Seed script — run once to populate Firestore with the initial 10 prompts.
// Usage: node scripts/seedPrompts.js
//
// Prerequisites:
// 1. npm install firebase-admin (in the project root)
// 2. Download a Firebase service account key JSON from Firebase Console
//    (Project Settings → Service Accounts → Generate new private key)
// 3. Set the path below or use GOOGLE_APPLICATION_CREDENTIALS env var

const admin = require('firebase-admin');

// Initialize with your service account key
// Option 1: Set GOOGLE_APPLICATION_CREDENTIALS env var to the JSON path
// Option 2: Replace the path below
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// The 10 initial prompts — each has a title, description, category, and order.
// "used" starts as false; when a prompt is assigned to a week, it flips to true.
const initialPrompts = [
  // Original 10
  { title: "Your favorite shared spot", description: "Where do you both love to be?", category: "nostalgic", order: 1 },
  { title: "Something that reminds you of them", description: "An object, place, or moment", category: "symbolic", order: 2 },
  { title: "Capture their laugh without showing their face", description: "Get creative with angles!", category: "creative", order: 3 },
  { title: "Sunrise or sunset together", description: "Chase the light", category: "challenge", order: 4 },
  { title: "Worst cooking attempt", description: "Kitchen disasters welcome", category: "silly", order: 5 },
  { title: "Where we had our best meal", description: "Food memories", category: "nostalgic", order: 6 },
  { title: "Your relationship in one object", description: "What represents you two?", category: "symbolic", order: 7 },
  { title: "Their hands doing what they love", description: "Focus on the details", category: "creative", order: 8 },
  { title: "Recreate your first photo together", description: "Same pose, new location?", category: "challenge", order: 9 },
  { title: "Them making that face", description: "You know the one", category: "silly", order: 10 },

  // Everyday life
  { title: "Your morning view", description: "The first thing you see when you wake up", category: "nostalgic", order: 11 },
  { title: "What's in your pocket right now?", description: "Empty your pockets and snap a pic", category: "silly", order: 12 },
  { title: "The last thing you ate", description: "Gourmet or gas station — no judgment", category: "creative", order: 13 },
  { title: "Your current workspace", description: "Messy desk? Clean desk? Show it", category: "challenge", order: 14 },
  { title: "Something you walked past today", description: "A detail most people would miss", category: "creative", order: 15 },

  // Moods & feelings
  { title: "Your mood in a color", description: "Find something that matches how you feel", category: "symbolic", order: 16 },
  { title: "What's stressing you out", description: "Take a photo of it and let it go", category: "challenge", order: 17 },
  { title: "Something that made you smile today", description: "Big or small, capture it", category: "nostalgic", order: 18 },
  { title: "Comfort zone", description: "Show your happy place right now", category: "nostalgic", order: 19 },
  { title: "A face that describes your week", description: "Selfie time — be dramatic", category: "silly", order: 20 },

  // Nature & outdoors
  { title: "Closest tree to you", description: "Go outside and find one", category: "challenge", order: 21 },
  { title: "The sky right now", description: "Look up and capture it", category: "creative", order: 22 },
  { title: "Something growing", description: "A plant, a flower, a weed — anything alive", category: "symbolic", order: 23 },
  { title: "Water", description: "A puddle, a glass, a river — find water", category: "creative", order: 24 },
  { title: "Your shadow", description: "Catch it doing something interesting", category: "silly", order: 25 },

  // Objects & stuff
  { title: "The oldest thing you own", description: "What's the story behind it?", category: "nostalgic", order: 26 },
  { title: "Something red", description: "Hunt for the brightest red near you", category: "challenge", order: 27 },
  { title: "Your shoes right now", description: "On your feet or wherever they are", category: "silly", order: 28 },
  { title: "Something you'd never throw away", description: "What makes it irreplaceable?", category: "symbolic", order: 29 },
  { title: "The inside of your fridge", description: "No cleaning first — keep it real", category: "silly", order: 30 },

  // People & connection
  { title: "Someone you saw today", description: "A stranger, a friend, your reflection", category: "creative", order: 31 },
  { title: "Hands", description: "Yours, theirs, or someone else's — tell a story with hands", category: "creative", order: 32 },
  { title: "Your favorite mug or cup", description: "The one you always reach for", category: "nostalgic", order: 33 },
  { title: "Where you sit most", description: "Your throne, your spot, your corner", category: "nostalgic", order: 34 },
  { title: "A note or message you received", description: "Text, sticky note, letter — anything", category: "symbolic", order: 35 },

  // Photography challenges
  { title: "Symmetry", description: "Find something perfectly balanced", category: "challenge", order: 36 },
  { title: "Through a window", description: "Shoot through glass — inside or outside", category: "creative", order: 37 },
  { title: "Tiny world", description: "Get as close as you can to something small", category: "creative", order: 38 },
  { title: "Light and dark", description: "Find a strong contrast between shadows and light", category: "challenge", order: 39 },
  { title: "From below", description: "Get low and shoot upward", category: "challenge", order: 40 },

  // Fun & random
  { title: "Your best attempt at art", description: "Draw, build, or arrange something", category: "silly", order: 41 },
  { title: "Something that doesn't belong", description: "Find something out of place", category: "creative", order: 42 },
  { title: "A sign that speaks to you", description: "Literal signs — street signs, store signs, any sign", category: "symbolic", order: 43 },
  { title: "The floor beneath you", description: "What are you standing on?", category: "challenge", order: 44 },
  { title: "Before and after", description: "Two shots of the same thing — transform it", category: "creative", order: 45 },

  // Texture & detail
  { title: "Something rough", description: "Find an interesting texture", category: "creative", order: 46 },
  { title: "Reflections", description: "In a mirror, a puddle, a screen — find yourself", category: "symbolic", order: 47 },
  { title: "Pattern hunting", description: "Find a repeating pattern around you", category: "challenge", order: 48 },
  { title: "The most boring thing near you", description: "Make it look interesting", category: "creative", order: 49 },
  { title: "Golden hour", description: "Catch that warm glow — morning or evening", category: "challenge", order: 50 },
];

async function seedPrompts() {
  const batch = db.batch();

  initialPrompts.forEach((prompt) => {
    const ref = db.collection('prompts').doc();
    batch.set(ref, { ...prompt, used: false });
  });

  await batch.commit();
  console.log(`Seeded ${initialPrompts.length} prompts to Firestore.`);
  process.exit(0);
}

seedPrompts().catch((err) => {
  console.error('Failed to seed prompts:', err);
  process.exit(1);
});
