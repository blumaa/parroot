import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  UploadMetadata,
} from 'firebase/storage';
import { getStorageInstance } from './firebase';
import { createDocument, deleteDocument } from './firestore';
import { Media } from '../types';

// ============================================
// STORAGE FUNCTIONS
// ============================================

/**
 * Upload an image file
 */
export async function uploadImage(
  file: File,
  folder: 'images' | 'branding' = 'images',
  uploadedBy: string
): Promise<{ url: string; mediaId: string }> {
  try {
    // Create unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const filePath = `${folder}/${filename}`;

    // Create storage reference
    const storage = getStorageInstance();
    const storageRef = ref(storage, filePath);

    // Upload file
    const metadata: UploadMetadata = {
      contentType: file.type,
    };
    const snapshot = await uploadBytes(storageRef, file, metadata);

    // Get download URL
    const url = await getDownloadURL(snapshot.ref);

    // Create media document in Firestore
    const mediaId = await createDocument<Media>('media', {
      url,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      uploadedBy,
    } as Omit<Media, 'id'>);

    return { url, mediaId };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete an image
 */
export async function deleteImage(url: string, mediaId?: string): Promise<void> {
  try {
    // Delete from Storage
    const storage = getStorageInstance();
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);

    // Delete media document from Firestore if mediaId provided
    if (mediaId) {
      await deleteDocument('media', mediaId);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: File[],
  folder: 'images' | 'branding' = 'images',
  uploadedBy: string
): Promise<Array<{ url: string; mediaId: string }>> {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder, uploadedBy));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): boolean {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
  }

  // Check file size (in bytes)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit.`);
  }

  return true;
}

/**
 * Get storage path from download URL
 */
export function getStoragePathFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)$/);
    if (pathMatch && pathMatch[1]) {
      return decodeURIComponent(pathMatch[1]);
    }
    throw new Error('Invalid storage URL');
  } catch (error) {
    console.error('Error parsing storage URL:', error);
    throw error;
  }
}
