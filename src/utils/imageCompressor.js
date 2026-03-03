import * as ImageManipulator from 'expo-image-manipulator';

// Compresses and resizes an image to reduce file size before uploading.
// Target: under 1MB for full-size photos.
// - maxWidth: constrains the image width (height scales proportionally)
// - quality: JPEG compression level (0.0 = max compression, 1.0 = no compression)
// Returns the local URI of the compressed image.
export async function compressImage(uri, maxWidth = 1920, quality = 0.8) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

// Generates a small square thumbnail for gallery grid display.
// Forces both width and height to `size` (crops to square).
// Uses lower quality (0.7) since thumbnails are displayed small.
// Returns the local URI of the thumbnail image.
export async function generateThumbnail(uri, size = 300) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: size, height: size } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}
