import type { QueryConstraint, DocumentData, Firestore, DocumentReference } from 'firebase/firestore';
import { doc } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

function parseDocPath(db: Firestore, path: string): DocumentReference {
  const [collectionName, ...docIdParts] = path.split('/');
  const docId = docIdParts.join('/');
  return doc(db, collectionName, docId);
}

export async function getDocument(
  path: string
): Promise<DocumentData | null> {
  const { getDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const docRef = parseDocPath(db, path);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function getCollection(
  collectionPath: string
): Promise<DocumentData[]> {
  const { collection, getDocs } = await import('firebase/firestore');
  const db = await getFirebaseDb();
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
  const { collection, addDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const collectionRef = collection(db, collectionPath);
  const docRef = await addDoc(collectionRef, data);
  return docRef.id;
}

export async function setDocument(
  path: string,
  data: DocumentData
): Promise<void> {
  const { setDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const docRef = parseDocPath(db, path);
  await setDoc(docRef, data);
}

export async function updateDocument(
  path: string,
  data: Partial<DocumentData>
): Promise<void> {
  const { updateDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const docRef = parseDocPath(db, path);
  await updateDoc(docRef, data);
}

export async function deleteDocument(path: string): Promise<void> {
  const { deleteDoc } = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const docRef = parseDocPath(db, path);
  await deleteDoc(docRef);
}

export async function queryCollection(
  collectionPath: string,
  constraints: QueryConstraint[]
): Promise<DocumentData[]> {
  const { collection, query, getDocs } = await import('firebase/firestore');
  const db = await getFirebaseDb();
  const collectionRef = collection(db, collectionPath);
  const q = query(collectionRef, ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
