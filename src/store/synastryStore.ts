import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserData {
  date: string;
  time: string;
  lat: number;
  lng: number;
  results?: any;
}

interface SynastryStore {
  user1: UserData | null;
  user2: UserData | null;
  synastryResult: any | null;
  setUser1: (data: UserData) => void;
  setUser2: (data: UserData) => void;
  setSynastryResult: (result: any | null) => void;
  reset: () => void;
}

export const useSynastryStore = create<SynastryStore>()(
  persist(
    (set) => ({
      user1: null,
      user2: null,
      synastryResult: null,
      setUser1: (data) => set({ user1: data }),
      setUser2: (data) => set({ user2: data }),
      setSynastryResult: (result) => set({ synastryResult: result }),
      reset: () => set({ user1: null, user2: null, synastryResult: null }),
    }),
    {
      name: 'cosmic-vibes-synastry-storage',
    }
  )
);
