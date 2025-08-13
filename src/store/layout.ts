import { create } from 'zustand'

interface LayoutStore {
  // Banner state
  isBannerClosed: boolean
  closeBanner: () => void
  
  // Sidebar state
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  
  // Mobile menu state
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
  
  // Header visibility
  isHeaderVisible: boolean
  setHeaderVisible: (visible: boolean) => void
  
  // Search state
  isSearchOpen: boolean
  toggleSearch: () => void
  setSearchOpen: (open: boolean) => void
  
  // Notification state
  isNotificationOpen: boolean
  toggleNotification: () => void
  setNotificationOpen: (open: boolean) => void
  
  // Profile dropdown state
  isProfileOpen: boolean
  toggleProfile: () => void
  setProfileOpen: (open: boolean) => void
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  // Banner
  isBannerClosed: false,
  closeBanner: () => {
    sessionStorage.setItem('topBannerClosed', 'true')
    set({ isBannerClosed: true })
  },
  
  // Sidebar
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  
  // Mobile menu
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  
  // Header
  isHeaderVisible: true,
  setHeaderVisible: (visible) => set({ isHeaderVisible: visible }),
  
  // Search
  isSearchOpen: false,
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  
  // Notifications
  isNotificationOpen: false,
  toggleNotification: () => set((state) => ({ isNotificationOpen: !state.isNotificationOpen })),
  setNotificationOpen: (open) => set({ isNotificationOpen: open }),
  
  // Profile
  isProfileOpen: false,
  toggleProfile: () => set((state) => ({ isProfileOpen: !state.isProfileOpen })),
  setProfileOpen: (open) => set({ isProfileOpen: open }),
}))