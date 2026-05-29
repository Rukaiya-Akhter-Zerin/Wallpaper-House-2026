import { create } from "zustand";

export type ViewName =
  | "dashboard"
  | "categories"
  | "favorites"
  | "collections"
  | "analytics"
  | "settings";

interface AppState {
  sidebarCollapsed: boolean;
  currentView: ViewName;
  searchOpen: boolean;
  toggleSidebar: () => void;
  setCurrentView: (view: ViewName) => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  currentView: "dashboard",
  searchOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCurrentView: (view) => set({ currentView: view }),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
