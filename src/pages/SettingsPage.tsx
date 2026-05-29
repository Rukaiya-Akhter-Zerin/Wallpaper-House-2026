import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { Settings, RotateCw, Download, Palette, Monitor, Keyboard, Info, Play, Square, Loader2, Trash2, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useSettingsStore, type RotateMode, type DownloadQuality, type ThemeMode } from "@/stores/settingsStore";
import { useRotation } from "@/hooks/useRotation";
import { useTheme } from "@/hooks/useTheme";
import { invoke } from "@tauri-apps/api/core";

const ROTATION_INTERVALS = [
  { label: "15 min", value: 900 },
  { label: "30 min", value: 1800 },
  { label: "1 hour", value: 3600 },
  { label: "3 hours", value: 10800 },
  { label: "6 hours", value: 21600 },
  { label: "12 hours", value: 43200 },
  { label: "24 hours", value: 86400 },
];

const ROTATE_MODES: { label: string; value: RotateMode; desc: string }[] = [
  { label: "Sequential", value: "sequential", desc: "Go through wallpapers in order" },
  { label: "Random", value: "random", desc: "Pick a random wallpaper each time" },
  { label: "Category", value: "category", desc: "Rotate within a selected category" },
  { label: "Favorites", value: "favorites", desc: "Only rotate through favorited wallpapers" },
];

const QUALITY_OPTIONS: { label: string; value: DownloadQuality; desc: string }[] = [
  { label: "Original", value: "original", desc: "Full resolution, no compression" },
  { label: "High", value: "high", desc: "90% quality, up to 4K" },
  { label: "Medium", value: "medium", desc: "80% quality, up to 2K" },
  { label: "Low", value: "low", desc: "70% quality, up to 1080p" },
];

const THEME_OPTIONS: { label: string; value: ThemeMode; icon: typeof Sun }[] = [
  { label: "Light", value: "light", icon: Sun },
  { label: "Dark", value: "dark", icon: Moon },
  { label: "System", value: "system", icon: Monitor },
];

export function SettingsPage() {
  const settings = useSettingsStore();
  const { status: rotStatus, startRotation, stopRotation } = useRotation();
  const { theme: resolvedTheme, setTheme: applyTheme } = useTheme();
  const [clearingCache, setClearingCache] = useState(false);

  const handleThemeChange = useCallback((t: ThemeMode) => {
    settings.update({ theme: t });
    applyTheme(t);
  }, [settings, applyTheme]);

  const handleRotationToggle = useCallback(async () => {
    if (rotStatus.active) {
      await stopRotation();
    } else {
      await startRotation(settings.autoRotateInterval, settings.rotateMode);
    }
  }, [rotStatus.active, stopRotation, startRotation, settings.autoRotateInterval, settings.rotateMode]);

  const handleClearCache = useCallback(async () => {
    setClearingCache(true);
    try {
      await invoke("clear_cache");
    } catch (err) {
      console.error("Failed to clear cache:", err);
    } finally {
      setClearingCache(false);
    }
  }, []);

  const handleLaunchAtStartup = useCallback(async (enabled: boolean) => {
    settings.update({ launchAtStartup: enabled });
    try {
      await invoke("plugin:autostart|set_enabled", { enabled });
    } catch (err) {
      console.error("Failed to set autostart:", err);
    }
  }, [settings]);

  return (
    <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible" className="flex h-full flex-col gap-6 p-6 max-w-3xl overflow-y-auto">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5"><Settings className="h-6 w-6 text-primary" /></div>
        <div><h1 className="text-2xl font-bold tracking-tight">Settings</h1><p className="text-sm text-muted-foreground">Configure rotation, downloads, and preferences</p></div>
      </motion.div>

      {/* Auto-Rotate Section */}
      <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCw className={cn("h-5 w-5", rotStatus.active ? "text-primary animate-spin" : "text-muted-foreground")} />
            <span className="font-medium">Auto-Rotate Wallpaper</span>
            {rotStatus.active && <Badge variant="default" className="text-xs">Active</Badge>}
          </div>
          <Switch checked={rotStatus.active} onCheckedChange={handleRotationToggle} />
        </div>

        {/* Rotation Interval */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Rotation interval</p>
          <div className="flex flex-wrap gap-2">
            {ROTATION_INTERVALS.map((i) => (
              <motion.button key={i.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => settings.update({ autoRotateInterval: i.value })}>
                <Badge variant={settings.autoRotateInterval === i.value ? "default" : "outline"} className="cursor-pointer">{i.label}</Badge>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Rotation Mode */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Rotation mode</p>
          <div className="grid grid-cols-2 gap-2">
            {ROTATE_MODES.map((m) => (
              <motion.button key={m.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => settings.update({ rotateMode: m.value })} className={cn("flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors", settings.rotateMode === m.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50")}>
                <span className="text-sm font-medium">{m.label}</span>
                <span className="text-xs text-muted-foreground">{m.desc}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Start/Stop Button */}
        <Button onClick={handleRotationToggle} variant={rotStatus.active ? "destructive" : "default"} className="w-full">
          {rotStatus.active ? <><Square className="mr-2 h-4 w-4" />Stop Rotation</> : <><Play className="mr-2 h-4 w-4" />Start Rotation</>}
        </Button>
        {rotStatus.active && rotStatus.next_rotation_at && (
          <p className="text-xs text-muted-foreground text-center">Next rotation: {new Date(rotStatus.next_rotation_at).toLocaleTimeString()}</p>
        )}
      </motion.div>

      {/* Download Quality Section */}
      <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2"><Download className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Download Quality</span></div>
        <div className="grid grid-cols-2 gap-2">
          {QUALITY_OPTIONS.map((q) => (
            <motion.button key={q.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => settings.update({ downloadQuality: q.value })} className={cn("flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors", settings.downloadQuality === q.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50")}>
              <span className="text-sm font-medium">{q.label}</span>
              <span className="text-xs text-muted-foreground">{q.desc}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Appearance Section */}
      <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2"><Palette className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Appearance</span></div>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((t) => {
            const Icon = t.icon;
            return (
              <motion.button key={t.value} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleThemeChange(t.value)} className={cn("flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors", settings.theme === t.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50")}>
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium capitalize">{t.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* General Section */}
      <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2"><Monitor className="h-5 w-5 text-muted-foreground" /><span className="font-medium">General</span></div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Launch at startup</p><p className="text-xs text-muted-foreground">Start Wallpaper House when your computer boots</p></div>
            <Switch checked={settings.launchAtStartup} onCheckedChange={handleLaunchAtStartup} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Minimize to tray</p><p className="text-xs text-muted-foreground">Keep running in the system tray when closed</p></div>
            <Switch checked={settings.minimizeToTray} onCheckedChange={(v) => settings.update({ minimizeToTray: v })} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Notifications</p><p className="text-xs text-muted-foreground">Show rotation and update notifications</p></div>
            <Switch checked={settings.notifications} onCheckedChange={(v) => settings.update({ notifications: v })} />
          </div>
        </div>
      </motion.div>

      {/* Storage Section */}
      <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Storage</span></div>
        <p className="text-sm text-muted-foreground">Clear locally cached wallpaper files to free up disk space.</p>
        <Button variant="outline" onClick={handleClearCache} disabled={clearingCache} className="w-full">
          {clearingCache ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Clearing...</> : <><Trash2 className="mr-2 h-4 w-4" />Clear Cache</>}
        </Button>
      </motion.div>

      {/* Keyboard Shortcuts */}
      <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2"><Keyboard className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Keyboard Shortcuts</span></div>
        <div className="space-y-2 text-sm">
          {[
            { action: "Search", keys: "Ctrl+K" },
            { action: "Close preview", keys: "Escape" },
            { action: "Next wallpaper", keys: "Arrow Right" },
            { action: "Previous wallpaper", keys: "Arrow Left" },
          ].map((s) => (
            <div key={s.action} className="flex justify-between"><span className="text-muted-foreground">{s.action}</span><Badge variant="outline">{s.keys}</Badge></div>
          ))}
        </div>
      </motion.div>

      {/* About */}
      <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div><span className="text-sm font-medium">Wallpaper House</span><p className="text-xs text-muted-foreground">Version 0.1.0</p></div>
          <Badge variant="secondary">Tauri v2 + React</Badge>
        </div>
      </motion.div>
    </motion.div>
  );
}
