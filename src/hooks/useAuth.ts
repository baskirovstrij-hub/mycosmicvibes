import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useTelegram } from './useTelegram';
import { useUserStore } from '../store/userStore';

export function useAuth() {
  const { user: tgUser } = useTelegram();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { setUserData, setNatalData, setMbtiData, setAnalysisData } = useUserStore();

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) unsubProfile();

      if (firebaseUser) {
        const userDoc = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot for the profile to catch payment updates in real-time
        unsubProfile = onSnapshot(userDoc, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setProfile(data);
            
            // Sync large data to store only if not already present
            // This prevents overwriting local state during active sessions
            if (data.userData && !useUserStore.getState().userData) setUserData(data.userData);
            if (data.natalData && !useUserStore.getState().natalData) setNatalData(data.natalData);
            if (data.analysisData && !useUserStore.getState().analysisData) setAnalysisData(data.analysisData);
          } else {
            // Create new profile if it doesn't exist
            const newProfile = {
              tgId: tgUser ? tgUser.id.toString() : 'web',
              firstName: tgUser?.first_name || 'Guest',
              username: tgUser?.username || '',
              isAnalysisPaid: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            setDoc(userDoc, newProfile);
          }
        });

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
      if (unsubProfile) unsubProfile();
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

  return { user, profile, loading, updateProfile };
}
