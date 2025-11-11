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

export async function getFileUrl(path: string): Promise<string> {
  const { ref, getDownloadURL } = await import('firebase/storage');
  const storage = await getFirebaseStorage();
  const storageRef = ref(storage, path);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

export async function deleteFile(path: string): Promise<void> {
  const { ref, deleteObject } = await import('firebase/storage');
  const storage = await getFirebaseStorage();
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
