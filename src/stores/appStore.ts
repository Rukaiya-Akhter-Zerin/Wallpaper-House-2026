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
  selectedCategoryId: number | null;
  toggleSidebar: () => void;
  setCurrentView: (view: ViewName) => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
  setSelectedCategoryId: (id: number | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  currentView: "dashboard",
  searchOpen: false,
  selectedCategoryId: null,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCurrentView: (view) => set({ currentView: view }),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
}));
