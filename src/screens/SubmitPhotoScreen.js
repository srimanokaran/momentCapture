import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useRelationship } from '../contexts/RelationshipContext';
import PhotoSubmission from '../components/PhotoSubmission';
import { capturePhoto, pickPhoto, uploadPhoto, submitPhotoToDay } from '../services/photoService';

// Screen for capturing or picking a photo, adding a caption, and uploading it.
// Shows upload progress and navigates back to Home on success.
export default function SubmitPhotoScreen({ navigation }) {
  const { user } = useAuth();
  const { currentDay, currentPrompt, relationshipId } = useRelationship();
  const [imageUri, setImageUri] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  console.log('SubmitPhotoScreen rendered, currentDay:', !!currentDay, 'relationshipId:', relationshipId);

  const handleCapture = async () => {
    try {
      const uri = await capturePhoto();
      if (uri) setImageUri(uri);
    } catch (err) {
      console.log('Capture error:', err.message);
      setError(err.message);
    }
  };

  const handlePick = async () => {
    try {
      const uri = await pickPhoto();
      if (uri) setImageUri(uri);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    if (!imageUri || !currentDay) return;

    setSubmitting(true);
    setUploadProgress(0);

    try {
      console.log('Starting upload...', 'dayId:', currentDay.dayId, 'userId:', user.uid);
      const { photoUrl, thumbnailUrl } = await uploadPhoto(
        imageUri,
        relationshipId,
        currentDay.dayId,
        user.uid,
        setUploadProgress
      );
      console.log('Upload done, saving to Firestore...');

      await submitPhotoToDay(
        relationshipId,
        currentDay.dayId,
        user.uid,
        photoUrl,
        thumbnailUrl,
        caption
      );
      console.log('Submission saved, going back');

      navigation.goBack();
    } catch (err) {
      console.log('Submit error:', err.code, err.message);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Show the current prompt as a card-style header */}
      {currentPrompt && (
        <View style={styles.promptHeader}>
          <View style={styles.promptIconWrapper}>
            <Icon name="lightbulb-outline" size={24} color="#FFB347" />
          </View>
          <View style={styles.promptTextWrapper}>
            <Text style={styles.promptLabel}>Today's prompt</Text>
            <Text style={styles.promptTitle}>
              {currentPrompt.title || "Today's prompt"}
            </Text>
          </View>
        </View>
      )}

      <PhotoSubmission
        imageUri={imageUri}
        onCapture={handleCapture}
        onPick={handlePick}
        caption={caption}
        onCaptionChange={setCaption}
        uploadProgress={uploadProgress}
        onSubmit={handleSubmit}
        disabled={submitting}
      />

      <Snackbar visible={!!error} onDismiss={() => setError('')} duration={3000}>
        {error}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#FF8FA3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  promptIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  promptTextWrapper: {
    flex: 1,
  },
  promptLabel: {
    fontSize: 12,
    color: '#8E8E8E',
    fontWeight: '600',
    marginBottom: 2,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
});
