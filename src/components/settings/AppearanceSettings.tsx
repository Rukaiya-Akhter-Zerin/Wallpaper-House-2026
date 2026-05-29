import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "motion/react";
import { Sun, Moon, Monitor } from "lucide-react";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "system" as const, label: "System", icon: Monitor },
  ];
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">Theme</p>
      <div className="flex gap-2">
        {options.map(({ value, label, icon: Icon }) => (
          <motion.button key={value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTheme(value)}>
            <Badge variant={theme === value ? "default" : "outline"} className="cursor-pointer flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" />{label}</Badge>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
