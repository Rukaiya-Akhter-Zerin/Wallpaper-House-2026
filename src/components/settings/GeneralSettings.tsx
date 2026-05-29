import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/stores/settingsStore";

export function GeneralSettings() {
  const { launchAtStartup, minimizeToTray, notifications, update } = useSettingsStore();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-medium">Launch at startup</p><p className="text-xs text-muted-foreground">Open when your computer starts</p></div>
        <Switch checked={launchAtStartup} onCheckedChange={(v) => update({ launchAtStartup: v })} />
      </div>
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-medium">Minimize to tray</p><p className="text-xs text-muted-foreground">Keep running when window is closed</p></div>
        <Switch checked={minimizeToTray} onCheckedChange={(v) => update({ minimizeToTray: v })} />
      </div>
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-medium">Notifications</p><p className="text-xs text-muted-foreground">Rotation and update notifications</p></div>
        <Switch checked={notifications} onCheckedChange={(v) => update({ notifications: v })} />
      </div>
    </div>
  );
}
