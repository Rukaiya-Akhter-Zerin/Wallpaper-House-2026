import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Variants } from "motion/react";
import { X, Heart, Download, ZoomIn, ZoomOut, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Wallpaper } from "@/types/database";

interface WallpaperPreviewProps {
  wallpaper: Wallpaper | null;
  onClose: () => void;
  onFavorite?: (wallpaper: Wallpaper) => void;
  onDownload?: (wallpaper: Wallpaper) => void | Promise<void>;
  onSetWallpaper?: (wallpaper: Wallpaper) => void;
  isFavorited?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  originRect?: DOMRect | null;
}

function getTargetRect() {
  const width = Math.min(window.innerWidth * 0.9, 1280);
  const height = window.innerHeight * 0.9;
  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
    width,
    height,
  };
}

const dialogEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const detailContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.38,
      staggerChildren: 0.055,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.16 },
  },
};

const detailItem: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.42, ease: dialogEase },
  },
  exit: {
    opacity: 0,
    y: 8,
    filter: "blur(4px)",
    transition: { duration: 0.16 },
  },
};

export function WallpaperPreview({ wallpaper, onClose, onFavorite, onDownload, onSetWallpaper, isFavorited = false, onNext, onPrev, originRect }: WallpaperPreviewProps) {
  const [scale, setScale] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const heroOriginRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (wallpaper && originRect) {
      heroOriginRef.current = {
        left: originRect.left,
        top: originRect.top,
        width: originRect.width,
        height: originRect.height,
      };
    }
  }, [wallpaper, originRect]);

  const targetRect = useMemo(
    () => (typeof window !== "undefined" ? getTargetRect() : { left: 0, top: 0, width: 0, height: 0 }),
    [wallpaper]
  );
  const startRect = useMemo(
    () => originRect
      ? { left: originRect.left, top: originRect.top, width: originRect.width, height: originRect.height }
      : heroOriginRef.current,
    [originRect]
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") onNext?.();
    if (e.key === "ArrowLeft") onPrev?.();
    if ((e.key === "=" || e.key === "+") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setScale(s => Math.min(s + 0.25, 5)); }
    if (e.key === "-" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setScale(s => Math.max(s - 0.25, 0.25)); }
    if (e.key === "0" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setScale(1); }
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    if (wallpaper) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      setScale(1);
    }
    return () => { document.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
  }, [wallpaper, handleKeyDown]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      const delta = -e.deltaY * 0.01;
      setScale(s => Math.min(Math.max(s + delta, 0.25), 5));
    }
  }, []);

  const zoomIn = () => setScale(s => Math.min(s + 0.5, 5));
  const zoomOut = () => setScale(s => Math.max(s - 0.5, 0.25));
  const resetZoom = () => setScale(1);

  const handleDownloadClick = useCallback(async () => {
    if (!wallpaper || !onDownload || isDownloading) return;
    setIsDownloading(true);
    try {
      await onDownload(wallpaper);
    } finally {
      setIsDownloading(false);
    }
  }, [wallpaper, onDownload, isDownloading]);

  return (
    <AnimatePresence>
      {wallpaper && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="fixed inset-0 z-[60]"
          onClick={onClose}
        >
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          <motion.div
            initial={startRect ? {
              left: targetRect.left,
              top: targetRect.top,
              width: targetRect.width,
              height: targetRect.height,
              x: startRect.left - targetRect.left,
              y: startRect.top - targetRect.top,
              scaleX: startRect.width / targetRect.width,
              scaleY: startRect.height / targetRect.height,
              opacity: 1,
              borderRadius: 12,
            } : {
              left: targetRect.left,
              top: targetRect.top,
              width: targetRect.width,
              height: targetRect.height,
              scale: 0.82,
              opacity: 0,
              borderRadius: 16,
            }}
            animate={{
              left: targetRect.left,
              top: targetRect.top,
              width: targetRect.width,
              height: targetRect.height,
              x: 0,
              y: 0,
              scaleX: 1,
              scaleY: 1,
              scale: 1,
              opacity: 1,
              borderRadius: 18,
            }}
            exit={startRect ? {
              left: targetRect.left,
              top: targetRect.top,
              width: targetRect.width,
              height: targetRect.height,
              x: startRect.left - targetRect.left,
              y: startRect.top - targetRect.top,
              scaleX: startRect.width / targetRect.width,
              scaleY: startRect.height / targetRect.height,
              opacity: 1,
              borderRadius: 12,
            } : {
              left: targetRect.left,
              top: targetRect.top,
              width: targetRect.width,
              height: targetRect.height,
              scale: 0.82,
              opacity: 0,
              borderRadius: 16,
            }}
            transition={{ duration: 0.82, ease: dialogEase }}
            className="fixed z-10 flex overflow-hidden bg-background/95 backdrop-blur-md border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ transformOrigin: "top left", willChange: "transform" }}
          >
            <motion.button
              onClick={onClose}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.32, delay: 0.45, ease: dialogEase }}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </motion.button>

            <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black/5" onWheel={handleWheel}>
              <motion.img
                ref={imgRef}
                src={wallpaper.image_url}
                alt={wallpaper.title}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, delay: 0.28, ease: dialogEase }}
                className="max-h-full max-w-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${scale})`, cursor: scale > 1 ? "zoom-out" : "zoom-in" }}
                onClick={() => scale === 1 ? zoomIn() : resetZoom()}
                draggable={false}
              />

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.35, delay: 0.56, ease: dialogEase }}
                className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-black/50 backdrop-blur-md px-3 py-2"
              >
                <button onClick={zoomOut} className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/20 transition-colors">
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button onClick={resetZoom} className="px-2 text-xs font-mono text-white/80 hover:text-white transition-colors min-w-[40px] text-center">
                  {Math.round(scale * 100)}%
                </button>
                <button onClick={zoomIn} className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/20 transition-colors">
                  <ZoomIn className="h-4 w-4" />
                </button>
              </motion.div>

              <AnimatePresence>
                {scale === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.35, delay: 0.62, ease: dialogEase }}
                    className="absolute bottom-4 left-4 rounded-lg bg-black/40 backdrop-blur-md px-3 py-1.5 text-xs text-white/60"
                  >
                    Pinch to zoom · Scroll to pan
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              variants={detailContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-80 flex flex-col border-l border-border bg-card p-6 overflow-y-auto"
            >
              <motion.div variants={detailItem}>
                <h2 className="text-xl font-semibold leading-tight">{wallpaper.title}</h2>
                {wallpaper.author && <p className="mt-1 text-sm text-muted-foreground">by {wallpaper.author}</p>}
              </motion.div>

              <motion.div variants={detailItem}>
                <Separator className="my-4" />
              </motion.div>

              <motion.div variants={detailItem} className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Resolution</span><Badge variant="outline">{wallpaper.resolution}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Dimensions</span><span>{wallpaper.width} x {wallpaper.height}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Orientation</span><span className="capitalize">{wallpaper.orientation}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Downloads</span><span>{wallpaper.downloads_count.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Likes</span><span>{wallpaper.likes_count.toLocaleString()}</span></div>
              </motion.div>

              {wallpaper.tags && wallpaper.tags.length > 0 && (
                <motion.div variants={detailItem}>
                  <Separator className="my-4" />
                  <div className="flex flex-wrap gap-1.5">
                    {wallpaper.tags.map((tag, index) => (
                      <motion.div
                        key={tag}
                        initial={{ opacity: 0, scale: 0.85, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.32, delay: 0.62 + index * 0.025, ease: dialogEase }}
                      >
                        <Badge variant="secondary" className="text-xs">{tag}</Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {wallpaper.dominant_color && (
                <motion.div variants={detailItem}>
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Color</span>
                    <motion.div
                      initial={{ scale: 0.65, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.35, delay: 0.74, ease: dialogEase }}
                      className="h-6 w-6 rounded-full border border-border"
                      style={{ backgroundColor: wallpaper.dominant_color }}
                    />
                    <span className="text-xs font-mono text-muted-foreground">{wallpaper.dominant_color}</span>
                  </div>
                </motion.div>
              )}

              <motion.div variants={detailItem} className="mt-auto pt-6 space-y-2">
                {onSetWallpaper && (
                  <Button className="w-full bg-gradient-to-r from-amber-100 via-rose-50 to-amber-100 text-black border border-amber-200/50 hover:from-amber-200 hover:via-rose-100 hover:to-amber-200 dark:bg-gradient-to-r dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 dark:text-white dark:border-zinc-800 dark:hover:from-zinc-800 dark:hover:via-zinc-900 dark:hover:to-zinc-800 shadow-sm" onClick={() => onSetWallpaper(wallpaper)}>
                    Set as Wallpaper
                  </Button>
                )}
                <div className="flex gap-2">
                  {onFavorite && <Button variant="outline" className="flex-1" onClick={() => onFavorite(wallpaper)}><Heart className={cn("mr-2 h-4 w-4", isFavorited && "fill-red-500 text-red-500")} />{isFavorited ? "Favorited" : "Favorite"}</Button>}
                  {onDownload && (
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 transition-all",
                        isDownloading && "border-cyan-300/80 bg-cyan-400/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.65),inset_0_0_12px_rgba(255,255,255,0.12)]"
                      )}
                      onClick={handleDownloadClick}
                      disabled={isDownloading}
                    >
                      {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin drop-shadow-[0_0_8px_rgba(103,232,249,1)]" /> : <Download className="mr-2 h-4 w-4" />}
                      {isDownloading ? "Downloading..." : "Download"}
                    </Button>
                  )}
                </div>
                {wallpaper.source_url && <Button variant="ghost" className="w-full text-xs" asChild><a href={wallpaper.source_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-3 w-3" />View Source</a></Button>}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
