import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

export async function getDocument(
  path: string
): Promise<DocumentData | null> {
  const db = getFirebaseDb();
  const pathParts = path.split('/');
  const collectionName = pathParts[0];
  const docId = pathParts.slice(1).join('/');
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function getCollection(
  collectionPath: string
): Promise<DocumentData[]> {
  const db = getFirebaseDb();
  const collectionRef = collection(db, collectionPath);
  const querySnapshot = await getDocs(collectionRef);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function addDocument(
  collectionPath: string,
  data: DocumentData
): Promise<string> {
  const db = getFirebaseDb();
  const collectionRef = collection(db, collectionPath);
  const docRef = await addDoc(collectionRef, data);
  return docRef.id;
}

export async function setDocument(
  path: string,
  data: DocumentData
): Promise<void> {
  const db = getFirebaseDb();
  const pathParts = path.split('/');
  const collectionName = pathParts[0];
  const docId = pathParts.slice(1).join('/');
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, data);
}

export async function updateDocument(
  path: string,
  data: Partial<DocumentData>
): Promise<void> {
  const db = getFirebaseDb();
  const pathParts = path.split('/');
  const collectionName = pathParts[0];
  const docId = pathParts.slice(1).join('/');
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
}

export async function deleteDocument(path: string): Promise<void> {
  const db = getFirebaseDb();
  const pathParts = path.split('/');
  const collectionName = pathParts[0];
  const docId = pathParts.slice(1).join('/');
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

export async function queryCollection(
  collectionPath: string,
  constraints: QueryConstraint[]
): Promise<DocumentData[]> {
  const db = getFirebaseDb();
  const collectionRef = collection(db, collectionPath);
  const q = query(collectionRef, ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
