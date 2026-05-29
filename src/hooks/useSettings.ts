import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export type DownloadQuality = "original" | "high" | "medium" | "low";
export type ThemeMode = "dark" | "light" | "system";
export type RotationMode = "sequential" | "random" | "category" | "favorites";

export interface AppSettings {
  autoRotateInterval: number; // seconds
  rotationMode: RotationMode;
  downloadQuality: DownloadQuality;
  theme: ThemeMode;
  launchAtStartup: boolean;
  minimizeToTray: boolean;
  notifications: boolean;
  cacheLimit: number; // MB
}

const SETTINGS_KEY = "wallpaper-house-settings";

const DEFAULTS: AppSettings = {
  autoRotateInterval: 3600,
  rotationMode: "sequential",
  downloadQuality: "high",
  theme: "system",
  launchAtStartup: false,
  minimizeToTray: true,
  notifications: true,
  cacheLimit: 5120,
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const update = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettingsState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleStartup = useCallback(async (enabled: boolean) => {
    try {
      if (enabled) {
        await invoke("plugin:autostart|enable");
      } else {
        await invoke("plugin:autostart|disable");
      }
      update("launchAtStartup", enabled);
    } catch (e) {
      console.error("Autostart toggle failed:", e);
    }
  }, [update]);

  const clearCache = useCallback(async () => {
    try {
      await invoke("clear_cache");
    } catch (e) {
      console.error("Clear cache failed:", e);
    }
  }, []);

  const getCacheSize = useCallback(async (): Promise<number> => {
    try {
      return await invoke<number>("get_cache_size");
    } catch {
      return 0;
    }
  }, []);

  return { settings, update, toggleStartup, clearCache, getCacheSize, defaults: DEFAULTS };
}
