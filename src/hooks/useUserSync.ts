import { useEffect, useRef } from 'react';
import { useUserStore } from '../store/userStore';
import { useAuth } from './useAuth';

export function useUserSync() {
  const { user, updateProfile } = useAuth();
  const { userData, natalData, mbtiResult, mbtiAnswers, analysisData } = useUserStore();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // Skip the first run to prevent overwriting cloud data with empty local data on start
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (user) {
      const timeoutId = setTimeout(async () => {
        try {
          await updateProfile({
            userData,
            natalData,
            mbtiResult,
            mbtiAnswers,
            analysisData
          });
        } catch (error) {
          console.error("Auto-sync error:", error);
        }
      }, 1000); // Debounce sync

      return () => clearTimeout(timeoutId);
    }
  }, [userData, natalData, mbtiResult, mbtiAnswers, analysisData, user]);
}
