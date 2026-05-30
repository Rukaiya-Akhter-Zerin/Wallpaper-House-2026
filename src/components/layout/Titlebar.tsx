import { useState } from "react";
import { Wallpaper, Info, Download } from "lucide-react";
import { AboutUsDialog } from "./AboutUsDialog";
import { UpdateDialog } from "./UpdateDialog";

export function Titlebar() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  return (
    <>
    <div className="flex h-10 shrink-0 items-center border-b border-border bg-background/80 backdrop-blur-sm select-none">
      <div className="flex-1 flex items-center gap-2 pl-3" data-tauri-drag-region>
        <Wallpaper className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold tracking-tight" data-tauri-drag-region>
          Wallpaper House
        </span>
      </div>
      <div className="flex items-center gap-1 pr-2">
        <button
          onClick={() => setUpdateOpen(true)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Download className="h-3.5 w-3.5" />
          Update
        </button>
        <button
          onClick={() => setAboutOpen(true)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Info className="h-3.5 w-3.5" />
          About
        </button>
      </div>
    </div>
    <AboutUsDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    <UpdateDialog open={updateOpen} onClose={() => setUpdateOpen(false)} />
    </>
  );
}
