import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
// CRITICAL: Must use firestoreDatabaseId for AI Studio apps
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connectivity check
async function testConnection() {
  try {
    // Attempting a read from a non-existent doc to trigger connection logic
    await getDocFromServer(doc(db, '_connection_test_', 'check'));
  } catch (error: any) {
    if (error.code === 'unavailable' || error.message?.includes('the client is offline')) {
      console.error("Firebase Connection Error: Please check your configuration and network.");
    } else {
      console.log("Firebase Connection Test (Expected response if doc missing):", error.code);
    }
  }
}

testConnection();
