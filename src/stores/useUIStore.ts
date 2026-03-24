import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';

interface UIState {
  isSidebarOpen: boolean;
  theme: ThemePreference;
  isNotificationsPanelOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: ThemePreference) => void;
  setNotificationsPanelOpen: (isOpen: boolean) => void;
  toggleNotificationsPanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  theme: 'system',
  isNotificationsPanelOpen: false,
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setTheme: (theme) => set({ theme }),
  setNotificationsPanelOpen: (isNotificationsPanelOpen) =>
    set({ isNotificationsPanelOpen }),
  toggleNotificationsPanel: () =>
    set((state) => ({
      isNotificationsPanelOpen: !state.isNotificationsPanelOpen,
    })),
}));