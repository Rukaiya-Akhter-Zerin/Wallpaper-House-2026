import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settingsStore";
import { motion } from "motion/react";
import { invoke } from "@tauri-apps/api/core";
import { Trash2 } from "lucide-react";

const QUALITIES = [
  { label: "Original", value: "original" }, { label: "High", value: "high" },
  { label: "Medium", value: "medium" }, { label: "Low", value: "low" },
];

export function DownloadSettings() {
  const { downloadQuality, update } = useSettingsStore();
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Download quality</p>
        <div className="flex flex-wrap gap-2">
          {QUALITIES.map((q) => (
            <motion.button key={q.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => update({ downloadQuality: q.value as any })}>
              <Badge variant={downloadQuality === q.value ? "default" : "outline"} className="cursor-pointer">{q.label}</Badge>
            </motion.button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div><p className="text-sm">Clear cache</p><p className="text-xs text-muted-foreground">Remove all cached wallpaper images</p></div>
        <Button variant="outline" size="sm" onClick={() => invoke("clear_cache")}><Trash2 className="mr-1.5 h-3.5 w-3.5" />Clear</Button>
      </div>
    </div>
  );
}
