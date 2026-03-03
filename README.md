# Moment Capture

A daily photo-sharing app for couples. Each day, both partners receive the same prompt, submit a photo independently, then reveal each other's photos together. React with emojis and comments to build a shared scrapbook over time.

## Features

- **Daily Prompts** — A new creative prompt each day (50+ built-in prompts across categories like nostalgic, creative, silly, challenge, symbolic)
- **Blind Submission** — Both partners submit photos without seeing each other's until reveal
- **Reveal & React** — Reveal photos together, then react with emojis and a comment thread
- **Calendar Gallery** — Browse past moments on a month-view calendar with photo thumbnails
- **Streaks** — Track your daily streak together

## Tech Stack

- **Frontend:** React Native + Expo
- **Backend:** Firebase (Firestore, Auth, Storage)
- **UI:** React Native Paper + Expo Linear Gradient

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project with Firestore, Auth (Email/Password), and Storage enabled

### Installation

```bash
git clone https://github.com/srimanokaran/momentCapture.git
cd momentCapture/moment-capture
npm install
```

### Environment Variables

Copy the example env file and fill in your Firebase config:

```bash
cp .env.example .env
```

```
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### Deploy Firestore Rules

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project your-project-id
```

### Seed Prompts

Place your Firebase service account key at `serviceAccountKey.json` in the project root, then:

```bash
node scripts/seedPrompts.js
```

### Run

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `i` for iOS simulator / `a` for Android emulator.

## Project Structure

```
src/
  components/
    PromptCard.js        # Displays the daily prompt
    PhotoSubmission.js   # Camera/gallery photo picker
    ReactionBar.js       # Emoji reactions + comment input
    WeekCard.js          # Calendar day cell with photo thumbnail
  screens/
    AuthScreen.js        # Login / sign up
    HomeScreen.js        # Today's prompt + actions
    SubmitPhotoScreen.js # Take/pick and submit a photo
    RevealScreen.js      # Reveal photos, react, comment
    GalleryScreen.js     # Calendar gallery of past moments
    ProfileScreen.js     # User profile + settings
  contexts/
    AuthContext.js         # Auth state provider
    RelationshipContext.js # Relationship + current day provider
  services/
    authService.js    # Firebase Auth helpers
    promptService.js  # Firestore prompt/day operations
    photoService.js   # Storage upload + Firestore submission
  utils/
    dateHelpers.js     # Date formatting utilities
    imageCompressor.js # Image compression before upload
  config/
    firebase.js  # Firebase initialization
  navigation/
    AppNavigator.js  # React Navigation stack
scripts/
  seedPrompts.js  # Seed Firestore with initial prompts
```
