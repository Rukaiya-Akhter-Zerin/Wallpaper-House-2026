import { motion } from "motion/react";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import { Settings, RotateCw, Download, Palette, Keyboard, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotationSettings } from "./RotationSettings";
import { DownloadSettings } from "./DownloadSettings";
import { AppearanceSettings } from "./AppearanceSettings";
import { GeneralSettings } from "./GeneralSettings";
import { ShortcutSettings } from "./ShortcutSettings";
import { AboutSettings } from "./AboutSettings";

const SECTIONS = [
  { title: "Rotation", icon: RotateCw, component: RotationSettings },
  { title: "Downloads", icon: Download, component: DownloadSettings },
  { title: "Appearance", icon: Palette, component: AppearanceSettings },
  { title: "General", icon: Settings, component: GeneralSettings },
  { title: "Keyboard Shortcuts", icon: Keyboard, component: ShortcutSettings },
  { title: "About", icon: Info, component: AboutSettings },
];

export function SettingsPage() {
  return (
    <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible" className="flex h-full flex-col gap-6 p-6">
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5"><Settings className="h-6 w-6 text-primary" /></div>
        <div><h1 className="text-2xl font-bold tracking-tight">Settings</h1><p className="text-sm text-muted-foreground">Customize your wallpaper experience</p></div>
      </motion.div>
      <div className="space-y-4">
        {SECTIONS.map(({ title, icon: Icon, component: Component }) => (
          <motion.div key={title} variants={fadeInUp}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4" />{title}</CardTitle></CardHeader>
              <CardContent><Component /></CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
