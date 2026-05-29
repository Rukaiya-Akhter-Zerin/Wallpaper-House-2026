import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Loader2, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Wallpaper } from "@/types/database";

export function SetWallpaperButton({ wallpaper, variant = "default", size = "default", className }: { wallpaper: Wallpaper; variant?: "default" | "outline" | "ghost"; size?: "default" | "sm" | "lg" | "icon"; className?: string }) {
  const [status, setStatus] = useState<"idle" | "downloading" | "setting" | "done" | "error">("idle");

  const handleSet = async () => {
    try {
      setStatus("downloading");
      // Download + cache + set all in Rust (avoids slow IPC byte transfer for 4K images)
      const cachePath = await invoke<string>("download_and_cache", { url: wallpaper.image_url });
      setStatus("setting");
      await invoke("set_wallpaper", { path: cachePath });
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to set wallpaper:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const labels = { idle: "Set as Wallpaper", downloading: "Downloading...", setting: "Setting...", done: "Wallpaper Set!", error: "Failed — Retry" };

  return (
    <Button variant={variant} size={size} onClick={handleSet} disabled={status !== "idle" && status !== "error"} className={cn(className)}>
      {(status === "downloading" || status === "setting") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : status === "idle" ? <Monitor className="mr-2 h-4 w-4" /> : null}
      {labels[status]}
    </Button>
  );
}
