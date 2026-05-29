import { Minus, Square, X, Wallpaper } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

export function Titlebar() {
  return (
    <div
      data-tauri-drag-region
      className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm select-none"
    >
      <div className="flex items-center gap-2 pl-3" data-tauri-drag-region>
        <Wallpaper className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold tracking-tight" data-tauri-drag-region>
          Wallpaper House
        </span>
      </div>
      <div className="flex h-full">
        <button
          onClick={() => appWindow.minimize()}
          className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Square className="h-3 w-3" />
        </button>
        <button
          onClick={() => appWindow.close()}
          className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
