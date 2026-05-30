import { useState, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { Download, Monitor, X, HardDrive } from "lucide-react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { cardHover } from "@/lib/motion";
import type { LocalImage } from "@/stores/localImagesStore";

interface LocalImageCardProps {
  image: LocalImage;
  onRemove: (id: string) => void;
}

export function LocalImageCard({ image, onRemove }: LocalImageCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [exists, setExists] = useState(true);
  const [wallpaperStatus, setWallpaperStatus] = useState<"idle" | "setting" | "done" | "error">("idle");
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "copying" | "done" | "error">("idle");

  const src = convertFileSrc(image.localPath);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setExists(true);
    img.onerror = () => setExists(false);
    img.src = src;
  }, [src]);

  const handleSetWallpaper = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setWallpaperStatus("setting");
      await invoke("set_wallpaper", { path: image.localPath });
      setWallpaperStatus("done");
      setTimeout(() => setWallpaperStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to set wallpaper:", err);
      setWallpaperStatus("error");
      setTimeout(() => setWallpaperStatus("idle"), 3000);
    }
  }, [image.localPath]);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloadStatus("copying");
      await invoke("copy_to_downloads", { sourcePath: image.localPath });
      setDownloadStatus("done");
      setTimeout(() => setDownloadStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy to Downloads:", err);
      setDownloadStatus("error");
      setTimeout(() => setDownloadStatus("idle"), 3000);
    }
  }, [image.localPath]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(image.id);
  }, [image.id, onRemove]);

  const removeButton = (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.9 }}
      whileHover={{ scale: 1.18 }}
      whileTap={{ scale: 0.9 }}
      className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center text-orange-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.95)] transition-colors hover:text-orange-200"
      onClick={handleRemove}
      title="Remove from collection"
    >
      <X className="h-5 w-5 stroke-[2.5]" />
    </motion.button>
  );

  if (!exists) {
    return (
      <motion.div
        {...cardHover}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="group relative cursor-default overflow-hidden rounded-xl"
        style={{ aspectRatio: "16/10" }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/80 p-4 text-center">
          <HardDrive className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">Image not found</p>
          <p className="text-xs text-muted-foreground/70">File may have been moved or deleted</p>
        </div>
        <div className="absolute left-2 top-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
            <HardDrive className="h-2.5 w-2.5" />
            Local
          </span>
        </div>
        {removeButton}
      </motion.div>
    );
  }

  return (
    <motion.div
      {...cardHover}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative cursor-pointer overflow-hidden rounded-xl"
      style={{ aspectRatio: "16/10" }}
      layout
    >
      {!loaded && <Skeleton className="absolute inset-0 h-full w-full rounded-xl" />}

      <motion.img
        src={src}
        alt={image.name}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setExists(false)}
        loading="lazy"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
      >
        <div className="absolute right-12 top-3 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDownload}
            disabled={downloadStatus !== "idle"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
            title="Copy to Downloads"
          >
            <Download className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSetWallpaper}
            disabled={wallpaperStatus !== "idle"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/90 text-white backdrop-blur-md hover:bg-blue-600/90"
            title="Set as Desktop Wallpaper"
          >
            <Monitor className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="truncate text-sm font-medium text-white">{image.name}</p>
          {wallpaperStatus === "setting" && <p className="mt-1 text-xs text-white/70">Setting wallpaper...</p>}
          {wallpaperStatus === "done" && <p className="mt-1 text-xs text-green-300">Wallpaper set!</p>}
          {downloadStatus === "copying" && <p className="mt-1 text-xs text-white/70">Copying to Downloads...</p>}
          {downloadStatus === "done" && <p className="mt-1 text-xs text-green-300">Copied to Downloads!</p>}
        </div>
      </motion.div>

      {removeButton}

      <div className="absolute left-2 top-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
          <HardDrive className="h-2.5 w-2.5" />
          Local
        </span>
      </div>
    </motion.div>
  );
}
