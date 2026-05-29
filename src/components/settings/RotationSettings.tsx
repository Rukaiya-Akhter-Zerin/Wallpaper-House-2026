import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/stores/settingsStore";
import { motion } from "motion/react";

const INTERVALS = [
  { label: "15 min", value: 900 }, { label: "30 min", value: 1800 }, { label: "1 hour", value: 3600 },
  { label: "3 hours", value: 10800 }, { label: "6 hours", value: 21600 }, { label: "12 hours", value: 43200 }, { label: "24 hours", value: 86400 },
];

export function RotationSettings() {
  const { autoRotateInterval, rotateMode, update } = useSettingsStore();
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Rotation interval</p>
        <div className="flex flex-wrap gap-2">
          {INTERVALS.map((i) => (
            <motion.button key={i.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => update({ autoRotateInterval: i.value })}>
              <Badge variant={autoRotateInterval === i.value ? "default" : "outline"} className="cursor-pointer">{i.label}</Badge>
            </motion.button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Rotation mode</p>
        <div className="flex flex-wrap gap-2">
          {(["sequential", "random", "category", "favorites"] as const).map((m) => (
            <motion.button key={m} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => update({ rotateMode: m })}>
              <Badge variant={rotateMode === m ? "default" : "outline"} className="cursor-pointer capitalize">{m}</Badge>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
