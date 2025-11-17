import { getFirebaseStorage } from './firebase';

export async function uploadFile(
  path: string,
  file: File
): Promise<string> {
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
  const storage = await getFirebaseStorage();
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}
