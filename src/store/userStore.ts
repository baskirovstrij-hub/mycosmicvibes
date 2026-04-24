import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserBirthData {
  name?: string;
  date: string;
  time: string;
  lat: number;
  lng: number;
  locationName?: string;
}

interface UserStore {
  userData: UserBirthData | null;
  natalData: any | null;
  mbtiResult: string | null;
  mbtiAnswers: Record<number, string> | null;
  analysisData: any | null;
  setUserData: (data: UserBirthData) => void;
  setNatalData: (data: any) => void;
  setMbtiData: (result: string | null, answers: Record<number, string> | null) => void;
  setAnalysisData: (data: any) => void;
  clearData: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userData: null,
      natalData: null,
      mbtiResult: null,
      mbtiAnswers: null,
      analysisData: null,
      setUserData: (data) => set({ userData: data, analysisData: null }),
      setNatalData: (data) => set({ natalData: data, analysisData: null }),
      setMbtiData: (result, answers) => set({ mbtiResult: result, mbtiAnswers: answers, analysisData: null }),
      setAnalysisData: (data) => set({ analysisData: data }),
      clearData: () => set({ userData: null, natalData: null, mbtiResult: null, mbtiAnswers: null, analysisData: null }),
    }),
    {
      name: 'cosmic-vibes-user-storage',
    }
  )
);
