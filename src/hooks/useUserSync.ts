import { useEffect, useRef } from 'react';
import { useUserStore } from '../store/userStore';
import { useAuth } from './useAuth';

// Simple equality check to avoid redundant writes
const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

export function useUserSync() {
  const { user, updateProfile } = useAuth();
  const { userData, natalData, mbtiResult, mbtiAnswers, analysisData } = useUserStore();
  const lastSyncedData = useRef<any>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (user) {
      const currentData = {
        userData,
        natalData,
        mbtiResult,
        mbtiAnswers,
        analysisData
      };

      // ONLY sync if data has actually changed since last sync/load
      if (lastSyncedData.current && isEqual(currentData, lastSyncedData.current)) {
        return;
      }

      const timeoutId = setTimeout(async () => {
        try {
          await updateProfile(currentData);
          lastSyncedData.current = currentData;
        } catch (error: any) {
          if (error.message?.includes('resource-exhausted')) {
            console.warn("Firestore Quota exceeded. Sync paused.");
          } else {
            console.error("Auto-sync error:", error);
          }
        }
      }, 5000); // 5 seconds debounce to save quota

      return () => clearTimeout(timeoutId);
    }
  }, [userData, natalData, mbtiResult, mbtiAnswers, analysisData, user]);
}
