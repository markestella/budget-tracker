import { create } from 'zustand';

export interface PendingMutation {
  id: string;
  entity: 'income-record' | 'account';
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  body?: unknown;
  createdAt: string;
}

interface OfflineState {
  isOnline: boolean;
  pendingMutations: PendingMutation[];
  setOnlineStatus: (isOnline: boolean) => void;
  enqueueMutation: (mutation: PendingMutation) => void;
  removePendingMutation: (mutationId: string) => void;
  clearPendingMutations: () => void;
}

const getInitialOnlineState = () =>
  typeof navigator === 'undefined' ? true : navigator.onLine;

export const useOfflineStore = create<OfflineState>((set) => ({
  isOnline: getInitialOnlineState(),
  pendingMutations: [],
  setOnlineStatus: (isOnline) => set({ isOnline }),
  enqueueMutation: (mutation) =>
    set((state) => ({
      pendingMutations: [...state.pendingMutations, mutation],
    })),
  removePendingMutation: (mutationId) =>
    set((state) => ({
      pendingMutations: state.pendingMutations.filter(
        (mutation) => mutation.id !== mutationId
      ),
    })),
  clearPendingMutations: () => set({ pendingMutations: [] }),
}));