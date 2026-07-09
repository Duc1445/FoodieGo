import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  activeModal: 'none' | 'login' | 'cart' | 'checkout';
  toggleSidebar: () => void;
  openModal: (modal: 'login' | 'cart' | 'checkout') => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  activeModal: 'none',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: 'none' }),
}));
