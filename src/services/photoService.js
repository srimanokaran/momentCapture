import * as ImagePicker from 'expo-image-picker';
import {
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { compressImage, generateThumbnail } from '../utils/imageCompressor';
import { FIREBASE_STORAGE_BUCKET } from '@env';

// Opens the device camera. Returns the local file URI, or null if cancelled.
export async function capturePhoto() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Camera permission is required to take photos.');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: true,
    aspect: [4, 3],
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
}

// Opens the photo library picker. Returns the local file URI, or null if cancelled.
export async function pickPhoto() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Photo library permission is required to select photos.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: true,
    aspect: [4, 3],
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
}

// Uploads a file to Firebase Storage using the REST API directly.
// The Firebase JS SDK has issues with blob uploads in React Native,
// so we bypass it and use fetch against the Storage REST endpoint.
async function uploadFileToStorage(localUri, storagePath) {
  // Get the current user's auth token
  const token = await auth.currentUser.getIdToken();

  // Read the file as a blob
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error('Failed to read file'));
    xhr.responseType = 'blob';
    xhr.open('GET', localUri, true);
    xhr.send(null);
  });

  // Encode the storage path for the URL
  const encodedPath = encodeURIComponent(storagePath);
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/${encodedPath}`;

  console.log('Uploading to:', uploadUrl);

  // Upload via REST API
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'image/jpeg',
    },
    body: blob,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log('Upload failed:', response.status, errorText);
    throw new Error(`Upload failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('Upload success, getting download URL...');

  // Get the download URL
  const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/${encodedPath}?alt=media&token=${data.downloadTokens}`;
  return downloadUrl;
}

// Full upload flow: compress → thumbnail → upload both to Firebase Storage.
// Returns { photoUrl, thumbnailUrl } — download URLs from Firebase Storage.
export async function uploadPhoto(imageUri, relationshipId, dayId, userId, onProgress) {
  // Compress the full-size image (target under 1MB)
  if (onProgress) onProgress(0.1);
  const compressedUri = await compressImage(imageUri);

  // Generate a 300x300 thumbnail for the gallery grid
  if (onProgress) onProgress(0.2);
  const thumbnailUri = await generateThumbnail(imageUri);

  // Upload full image
  if (onProgress) onProgress(0.4);
  const photoUrl = await uploadFileToStorage(
    compressedUri,
    `images/${relationshipId}/${dayId}/${userId}_full.jpg`
  );

  // Upload thumbnail
  if (onProgress) onProgress(0.8);
  const thumbnailUrl = await uploadFileToStorage(
    thumbnailUri,
    `images/${relationshipId}/${dayId}/${userId}_thumb.jpg`
  );

  if (onProgress) onProgress(1);
  return { photoUrl, thumbnailUrl };
}

// Saves the submission (photo URLs + caption) to the dailyPrompts Firestore doc
export async function submitPhotoToDay(relationshipId, dayId, userId, photoUrl, thumbnailUrl, caption) {
  const dayDocId = `${dayId}-${relationshipId}`;
  await updateDoc(doc(db, 'dailyPrompts', dayDocId), {
    [`submissions.${userId}`]: {
      photoUrl,
      thumbnailUrl,
      caption: caption || '',
      submittedAt: serverTimestamp(),
    },
  });
}
