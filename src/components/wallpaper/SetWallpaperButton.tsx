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
      const response = await fetch(wallpaper.image_url);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const data = Array.from(new Uint8Array(arrayBuffer));
      setStatus("setting");
      await invoke("save_to_cache", { url: wallpaper.image_url, data });
      const cachePath = await invoke<string>("read_from_cache", { url: wallpaper.image_url });
      if (cachePath) { await invoke("set_wallpaper", { path: cachePath }); }
      else { throw new Error("Cache path not found"); }
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
