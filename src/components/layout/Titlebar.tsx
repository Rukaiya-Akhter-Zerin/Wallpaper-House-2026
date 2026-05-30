import { Wallpaper } from "lucide-react";

export function Titlebar() {
  return (
    <div
      data-tauri-drag-region
      className="flex h-10 shrink-0 items-center border-b border-border bg-background/80 backdrop-blur-sm select-none"
    >
      <div className="flex items-center gap-2 pl-3" data-tauri-drag-region>
        <Wallpaper className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold tracking-tight" data-tauri-drag-region>
          Wallpaper House
        </span>
      </div>
    </div>
  );
}
