'use client';

import { createContext, type ReactNode, useContext } from 'react';
import { useLayoutStore } from '@/store/layout';

interface LayoutContextType {
  // Re-export all store functions for convenience
  isBannerClosed: boolean;
  closeBanner: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  isHeaderVisible: boolean;
  setHeaderVisible: (visible: boolean) => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  toggleNotification: () => void;
  setNotificationOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  toggleProfile: () => void;
  setProfileOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const layoutStore = useLayoutStore();

  return <LayoutContext.Provider value={layoutStore}>{children}</LayoutContext.Provider>;
}

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
