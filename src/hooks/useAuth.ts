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

      // Fallback timeout in case Firebase is stuck or quota exceeded
      const authTimeout = setTimeout(() => {
        if (loading) {
          console.warn("Auth sync timed out, potentially due to Firebase limits. Proceeding with local state.");
          setLoading(false);
        }
      }, 6000);

      if (firebaseUser) {
        const userDoc = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot for the profile to catch payment updates in real-time
        unsubProfile = onSnapshot(userDoc, (snap) => {
          clearTimeout(authTimeout);
          if (snap.exists()) {
            const data = snap.data();
            setProfile(data);
            
            // Sync large data to store only if not already present
            if (data.userData && !useUserStore.getState().userData) setUserData(data.userData);
            if (data.natalData && !useUserStore.getState().natalData) setNatalData(data.natalData);
            if (data.analysisData && !useUserStore.getState().analysisData) setAnalysisData(data.analysisData);
          } else {
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
          setLoading(false);
        }, (error) => {
          clearTimeout(authTimeout);
          console.error("Profile sync error (likely Quota Exceeded):", error);
          setLoading(false);
        });

        setUser(firebaseUser);
      } else {
        clearTimeout(authTimeout); // Not needed if not logged in yet
        try {
          await signInAnonymously(auth);
        } catch (error: any) {
          console.error("Auth Error:", error);
          setLoading(false);
        }
      }
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
