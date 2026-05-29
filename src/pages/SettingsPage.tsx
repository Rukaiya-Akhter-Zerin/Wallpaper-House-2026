import { useState } from "react";
import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { Settings, RotateCw, Download, Palette, Monitor, Keyboard, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const QUALITY_OPTIONS = [
  { label: "Original", value: "original", desc: "Full resolution" },
  { label: "High", value: "high", desc: "3840px wide" },
  { label: "Medium", value: "medium", desc: "2560px wide" },
  { label: "Low", value: "low", desc: "1920px wide" },
];

export function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [rotationInterval, setRotationInterval] = useState(3600);
  const [rotationEnabled, setRotationEnabled] = useState(false);
  const [downloadQuality, setDownloadQuality] = useState("high");
  const [launchAtStartup, setLaunchAtStartup] = useState(false);
  const [minimizeToTray, setMinimizeToTray] = useState(true);

  return (
    <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible" className="flex h-full flex-col gap-6 p-6 max-w-3xl">
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5"><Settings className="h-6 w-6 text-primary" /></div>
        <div><h1 className="text-2xl font-bold tracking-tight">Settings</h1><p className="text-sm text-muted-foreground">Configure rotation, downloads, and preferences</p></div>
      </motion.div>
      <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><RotateCw className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Auto-Rotate Wallpaper</span></div>
          <Switch checked={rotationEnabled} onCheckedChange={setRotationEnabled} />
        </div>
        {rotationEnabled && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Rotation interval</p>
            <div className="flex flex-wrap gap-2">
              {[{ l: "15 min", v: 900 }, { l: "30 min", v: 1800 }, { l: "1 hour", v: 3600 }, { l: "3 hours", v: 10800 }, { l: "6 hours", v: 21600 }, { l: "12 hours", v: 43200 }, { l: "24 hours", v: 86400 }].map((i) => (
                <motion.button key={i.v} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setRotationInterval(i.v)}>
                  <Badge variant={rotationInterval === i.v ? "default" : "outline"} className="cursor-pointer">{i.l}</Badge>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
      <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2"><Download className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Download Quality</span></div>
        <div className="grid grid-cols-2 gap-2">
          {QUALITY_OPTIONS.map((q) => (
            <motion.button key={q.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setDownloadQuality(q.value)} className={cn("flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors", downloadQuality === q.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50")}>
              <span className="text-sm font-medium">{q.label}</span><span className="text-xs text-muted-foreground">{q.desc}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
      <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2"><Palette className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Appearance</span></div>
        <div className="flex gap-2">
          {(["light", "system", "dark"] as const).map((t) => (
            <motion.button key={t} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTheme(t)}>
              <Badge variant={theme === t ? "default" : "outline"} className="cursor-pointer capitalize">{t}</Badge>
            </motion.button>
          ))}
        </div>
      </motion.div>
      <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2"><Monitor className="h-5 w-5 text-muted-foreground" /><span className="font-medium">General</span></div>
        <div className="space-y-3">
          <div className="flex items-center justify-between"><span className="text-sm">Launch at startup</span><Switch checked={launchAtStartup} onCheckedChange={setLaunchAtStartup} /></div>
          <Separator /><div className="flex items-center justify-between"><span className="text-sm">Minimize to tray</span><Switch checked={minimizeToTray} onCheckedChange={setMinimizeToTray} /></div>
        </div>
      </motion.div>
      <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2"><Keyboard className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Keyboard Shortcuts</span></div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Search</span><Badge variant="outline">Ctrl+K</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Close preview</span><Badge variant="outline">Escape</Badge></div>
        </div>
      </motion.div>
      <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div><span className="text-sm font-medium">Wallpaper House</span><p className="text-xs text-muted-foreground">Version 0.1.0</p></div>
          <Badge variant="secondary">Tauri v2 + React</Badge>
        </div>
      </motion.div>
    </motion.div>
  );
}
