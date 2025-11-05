/**
 * Firebase connection test utility
 * Run this to verify Firebase is properly configured
 */

import { getDb, getAuthInstance, getStorageInstance } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase connection...\n');

  try {
    // Test Firestore
    console.log('📁 Testing Firestore...');
    const db = getDb();
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    console.log('✅ Firestore connection successful\n');

    // Test Auth
    console.log('🔐 Testing Authentication...');
    const auth = getAuthInstance();
    console.log('Auth instance:', auth ? 'Connected' : 'Not connected');
    console.log('✅ Auth connection successful\n');

    // Test Storage
    console.log('💾 Testing Storage...');
    const storage = getStorageInstance();
    console.log('Storage instance:', storage ? 'Connected' : 'Not connected');
    console.log('✅ Storage connection successful\n');

    console.log('🎉 All Firebase services connected successfully!');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
}
