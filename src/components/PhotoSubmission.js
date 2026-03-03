import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, TextInput, ProgressBar, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

// Photo submission form with camera/library buttons, image preview,
// caption input (100 char limit), upload progress bar, and submit button.
export default function PhotoSubmission({
  imageUri,
  onCapture,
  onPick,
  caption,
  onCaptionChange,
  uploadProgress,
  onSubmit,
  disabled,
}) {
  return (
    <View style={styles.container}>
      {/* Image preview or placeholder */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Icon name="camera-plus-outline" size={48} color="#FFB347" />
          <Text style={styles.placeholderText}>Tap below to add a photo</Text>
        </View>
      )}

      {/* Camera and library buttons */}
      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          icon="camera"
          onPress={onCapture}
          disabled={disabled}
          style={styles.button}
          labelStyle={{ color: '#FF6B6B' }}
        >
          Take Photo
        </Button>
        <Button
          mode="outlined"
          icon="image"
          onPress={onPick}
          disabled={disabled}
          style={styles.button}
          labelStyle={{ color: '#FF6B6B' }}
        >
          Library
        </Button>
      </View>

      {/* Caption input with character counter */}
      <TextInput
        label="Caption (optional)"
        value={caption}
        onChangeText={onCaptionChange}
        maxLength={100}
        style={styles.caption}
        disabled={disabled}
      />
      <Text style={styles.charCount}>{caption?.length || 0}/100</Text>

      {/* Upload progress bar — only visible during upload */}
      {uploadProgress !== null && uploadProgress !== undefined && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={uploadProgress} style={styles.progressBar} />
          <Text style={styles.progressText}>{Math.round(uploadProgress * 100)}%</Text>
        </View>
      )}

      {/* Submit button — gradient or gray fallback */}
      <TouchableOpacity
        onPress={onSubmit}
        disabled={disabled || !imageUri}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={disabled || !imageUri ? ['#C4C4C4', '#D4D4D4'] : ['#FF6B6B', '#FF8E8E']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.submitGradient}
        >
          <Icon name="check-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.submitText}>Submit Photo</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    marginBottom: 16,
  },
  placeholder: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    backgroundColor: '#FFF8F0',
    borderWidth: 2,
    borderColor: '#FFB347',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    color: '#8E8E8E',
    fontSize: 15,
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 24,
    borderColor: '#FFE0E6',
  },
  caption: {
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  charCount: {
    textAlign: 'right',
    color: '#8E8E8E',
    fontSize: 12,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFE0E6',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
    color: '#8E8E8E',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
  },
  submitText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
