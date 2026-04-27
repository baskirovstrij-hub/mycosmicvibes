import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useTelegram } from './useTelegram';
import { useUserStore } from '../store/userStore';

export function useAuth() {
  const { user: tgUser } = useTelegram();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUserData, setNatalData, setMbtiData, setAnalysisData } = useUserStore();

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Cleanup previous profile listener if it exists
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = undefined;
      }

      if (firebaseUser) {
        // Listen to profile changes in real-time
        const userDoc = doc(db, 'users', firebaseUser.uid);
        
        unsubProfile = onSnapshot(userDoc, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Sync Firebase data to local store IF store is empty (initial load)
            // or if we want Firebase to be the source of truth
            if (data.userData) setUserData(data.userData);
            if (data.natalData) setNatalData(data.natalData);
            if (data.mbtiResult || data.mbtiAnswers) {
              setMbtiData(data.mbtiResult || null, data.mbtiAnswers || null);
            }
            if (data.analysisData) setAnalysisData(data.analysisData);
          }
        }, (err) => {
          console.error("Profile sync error:", err);
        });

        // Initial creation with TG data if needed
        const snap = await getDoc(userDoc);
        if (!snap.exists()) {
          const newProfile = {
            tgId: tgUser ? tgUser.id.toString() : 'web',
            firstName: tgUser?.first_name || 'Guest',
            username: tgUser?.username || '',
            isAnalysisPaid: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await setDoc(userDoc, newProfile);
        }

        setUser(firebaseUser);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error: any) {
          if (error.code === 'auth/admin-restricted-operation') {
            console.error("Firebase Auth Error: Please enable 'Anonymous' sign-in provider in your Firebase Console (Authentication -> Sign-in method).");
          } else {
            console.error("Auth Error:", error);
          }
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubProfile) {
        unsubProfile();
      }
    };
  }, [tgUser]);

  const updateProfile = async (data: any) => {
    if (!user) return;
    const userDoc = doc(db, 'users', user.uid);
    
    // Filter out undefined keys
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    await updateDoc(userDoc, {
      ...cleanData,
      updatedAt: serverTimestamp()
    });
  };

  return { user, loading, updateProfile };
}
