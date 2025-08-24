import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// This store manages client-side notification preferences and UI state
// Actual notification data is managed by React Query (useNotifications hook)
interface NotificationStore {
  // User preferences (persisted)
  soundEnabled: boolean;
  desktopNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  
  // UI state (not persisted)
  isDropdownOpen: boolean;
  lastChecked: Date | null;
  
  // Preference actions
  toggleSound: () => void;
  toggleDesktopNotifications: () => void;
  toggleEmailNotifications: () => void;
  
  // UI actions
  toggleDropdown: () => void;
  setDropdownOpen: (open: boolean) => void;
  setLastChecked: (date: Date) => void;
  
  // Utility
  requestNotificationPermission: () => Promise<boolean>;
  playNotificationSound: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // User preferences (persisted)
      soundEnabled: true,
      desktopNotificationsEnabled: false,
      emailNotificationsEnabled: true,
      
      // UI state (not persisted)
      isDropdownOpen: false,
      lastChecked: null,
      
      // Preference actions
      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },
      
      toggleDesktopNotifications: () => {
        set((state) => ({ desktopNotificationsEnabled: !state.desktopNotificationsEnabled }));
      },
      
      toggleEmailNotifications: () => {
        set((state) => ({ emailNotificationsEnabled: !state.emailNotificationsEnabled }));
      },
      
      // UI actions
      toggleDropdown: () => {
        set((state) => ({ isDropdownOpen: !state.isDropdownOpen }));
      },
      
      setDropdownOpen: (open) => {
        set({ isDropdownOpen: open });
        if (open) {
          set({ lastChecked: new Date() });
        }
      },
      
      setLastChecked: (date) => {
        set({ lastChecked: date });
      },
      
      // Utility
      requestNotificationPermission: async () => {
        if (!('Notification' in window)) {
          return false;
        }
        
        if (Notification.permission === 'granted') {
          return true;
        }
        
        if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        
        return false;
      },
      
      playNotificationSound: () => {
        if (!get().soundEnabled) return;
        
        // Create and play notification sound
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch((error) => {
          console.error('Failed to play notification sound:', error);
        });
      },
    }),
    {
      name: 'notification-preferences',
      // Only persist user preferences, not UI state
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        desktopNotificationsEnabled: state.desktopNotificationsEnabled,
        emailNotificationsEnabled: state.emailNotificationsEnabled,
      }),
    }
  )
);