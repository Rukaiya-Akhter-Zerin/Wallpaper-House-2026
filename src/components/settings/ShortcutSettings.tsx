import { Badge } from "@/components/ui/badge";

const SHORTCUTS = [
  ["Search", "Ctrl+K"], ["Close preview", "Escape"],
  ["Next wallpaper", "Arrow Right"], ["Previous wallpaper", "Arrow Left"],
  ["Toggle zoom", "Z"],
];

export function ShortcutSettings() {
  return (
    <div className="space-y-2">
      {SHORTCUTS.map(([action, key]) => (
        <div key={action} className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{action}</span>
          <Badge variant="outline">{key}</Badge>
        </div>
      ))}
    </div>
  );
}
