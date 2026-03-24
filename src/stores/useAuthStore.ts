import { create } from 'zustand';
import { Session } from 'next-auth';

interface AuthState {
  session: Session | null;
  isDemoMode: boolean;
  setSession: (session: Session | null) => void;
  setDemoMode: (isDemoMode: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isDemoMode: false,
  setSession: (session) => set({ session }),
  setDemoMode: (isDemoMode) => set({ isDemoMode }),
  clearSession: () => set({ session: null, isDemoMode: false }),
}));