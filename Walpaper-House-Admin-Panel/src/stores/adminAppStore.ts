import { create } from "zustand";

export type AdminView =
  | "dashboard"
  | "wallpapers"
  | "wallpaper-create"
  | "wallpaper-edit"
  | "featured"
  | "editors-choice"
  | "popular"
  | "categories";

interface AdminAppState {
  currentView: AdminView;
  sidebarCollapsed: boolean;
  selectedWallpaperId: number | null;
  setCurrentView: (view: AdminView) => void;
  toggleSidebar: () => void;
  setSelectedWallpaperId: (id: number | null) => void;
}

export const useAdminAppStore = create<AdminAppState>((set) => ({
  currentView: "dashboard",
  sidebarCollapsed: false,
  selectedWallpaperId: null,
  setCurrentView: (view) => set({ currentView: view }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSelectedWallpaperId: (id) => set({ selectedWallpaperId: id }),
}));
