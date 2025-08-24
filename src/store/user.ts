import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { apiGet, apiPut } from '@/lib/api-client';

interface UserStore {
  // User data
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Preferences
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  
  // Actions
  fetchUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updatePreferences: (prefs: Partial<UserStore['preferences']>) => void;
  clearUser: () => void;
  setError: (error: string | null) => void;
}

const defaultPreferences = {
  language: 'ko',
  theme: 'system' as const,
  emailNotifications: true,
  pushNotifications: false,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      preferences: defaultPreferences,

      fetchUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiGet<User>('/api/user/profile');
          set({ user: data, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '사용자 정보 로드 실패';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          console.error('Failed to fetch user:', error);
        }
      },

      updateUser: async (updates) => {
        const currentUser = get().user;
        if (!currentUser) {
          set({ error: '사용자 정보가 없습니다' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          // Optimistic update
          set({ user: { ...currentUser, ...updates } });
          
          // API call
          const updatedUser = await apiPut<User>('/api/user/profile', updates);
          set({ user: updatedUser, isLoading: false });
        } catch (error) {
          // Rollback on error
          set({ 
            user: currentUser,
            error: error instanceof Error ? error.message : '프로필 업데이트 실패',
            isLoading: false 
          });
          console.error('Failed to update user:', error);
        }
      },

      updatePreferences: (prefs) => {
        set((state) => ({
          preferences: { ...state.preferences, ...prefs }
        }));
      },

      clearUser: () => {
        set({ 
          user: null, 
          error: null,
          preferences: defaultPreferences 
        });
      },

      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        user: state.user,
        preferences: state.preferences 
      }),
    }
  )
);