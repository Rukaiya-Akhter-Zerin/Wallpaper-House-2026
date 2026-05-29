import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RotateMode = "sequential" | "random" | "category" | "favorites";
export type DownloadQuality = "original" | "high" | "medium" | "low";
export type ThemeMode = "dark" | "light" | "system";

interface SettingsState {
  autoRotateInterval: number;
  rotateMode: RotateMode;
  selectedCategory: string | null;
  downloadQuality: DownloadQuality;
  theme: ThemeMode;
  launchAtStartup: boolean;
  minimizeToTray: boolean;
  notifications: boolean;
  cacheLimit: number;
  setSetting: <K extends keyof Omit<SettingsState, "setSetting" | "update">>(key: K, value: SettingsState[K]) => void;
  update: (partial: Partial<Omit<SettingsState, "setSetting" | "update">>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoRotateInterval: 3600,
      rotateMode: "sequential",
      selectedCategory: null,
      downloadQuality: "high",
      theme: "system",
      launchAtStartup: false,
      minimizeToTray: true,
      notifications: true,
      cacheLimit: 5 * 1024 * 1024 * 1024,
      setSetting: (key, value) => set({ [key]: value }),
      update: (partial) => set(partial),
    }),
    { name: "wallpaper-house-settings" }
  )
);
