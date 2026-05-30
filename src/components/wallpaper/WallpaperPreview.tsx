import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, Download, ZoomIn, ZoomOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Wallpaper } from "@/types/database";

interface WallpaperPreviewProps {
  wallpaper: Wallpaper | null;
  onClose: () => void;
  onFavorite?: (wallpaper: Wallpaper) => void;
  onDownload?: (wallpaper: Wallpaper) => void;
  onSetWallpaper?: (wallpaper: Wallpaper) => void;
  isFavorited?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  originRect?: DOMRect | null;
}

export function WallpaperPreview({ wallpaper, onClose, onFavorite, onDownload, onSetWallpaper, isFavorited = false, onNext, onPrev, originRect }: WallpaperPreviewProps) {
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  // Calculate animation origin from card rect
  const getOriginAnimation = () => {
    if (!originRect) return {};
    const dialogW = Math.min(window.innerWidth * 0.9, 1280);
    const dialogH = window.innerHeight * 0.9;
    const dialogCx = window.innerWidth / 2;
    const dialogCy = window.innerHeight / 2;
    const cardCx = originRect.left + originRect.width / 2;
    const cardCy = originRect.top + originRect.height / 2;
    const offsetX = cardCx - dialogCx;
    const offsetY = cardCy - dialogCy;
    const scaleX = originRect.width / dialogW;
    const scaleY = originRect.height / dialogH;
    return { x: offsetX, y: offsetY, scaleX, scaleY };
  };

  const origin = getOriginAnimation();

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

  /* Touchpad / mouse wheel pinch-to-zoom */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Pinch gesture: ctrlKey is true on trackpad pinch
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

  return (
    <AnimatePresence>
      {wallpaper && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="fixed inset-0 z-[60] flex items-center justify-center" onClick={onClose}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.1 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          <motion.div
            initial={originRect ? { x: origin.x, y: origin.y, scaleX: origin.scaleX, scaleY: origin.scaleY, opacity: 0, borderRadius: "12px" } : { scale: 0.6, opacity: 0, y: 80 }}
            animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, borderRadius: "16px" }}
            exit={originRect ? { x: origin.x, y: origin.y, scaleX: origin.scaleX, scaleY: origin.scaleY, opacity: 0 } : { scale: 0.7, opacity: 0, y: 40 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex h-[90vh] w-[90vw] max-w-7xl overflow-hidden rounded-2xl bg-background/95 backdrop-blur-md border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close — top-right of the dialog */}
            <button onClick={onClose} className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors">
              <X className="h-5 w-5" />
            </button>

            {/* Image area */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black/5" onWheel={handleWheel}>
              <img
                ref={imgRef}
                src={wallpaper.image_url}
                alt={wallpaper.title}
                className="max-h-full max-w-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${scale})`, cursor: scale > 1 ? "zoom-out" : "zoom-in" }}
                onClick={() => scale === 1 ? zoomIn() : resetZoom()}
                draggable={false}
              />

              {/* Zoom controls */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-black/50 backdrop-blur-md px-3 py-2">
                <button onClick={zoomOut} className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/20 transition-colors">
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button onClick={resetZoom} className="px-2 text-xs font-mono text-white/80 hover:text-white transition-colors min-w-[40px] text-center">
                  {Math.round(scale * 100)}%
                </button>
                <button onClick={zoomIn} className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/20 transition-colors">
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>

              {/* Touchpad hint */}
              {scale === 1 && (
                <div className="absolute bottom-4 left-4 rounded-lg bg-black/40 backdrop-blur-md px-3 py-1.5 text-xs text-white/60">
                  Pinch to zoom · Scroll to pan
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-80 flex flex-col border-l border-border bg-card p-6 overflow-y-auto">
              <h2 className="text-xl font-semibold leading-tight">{wallpaper.title}</h2>
              {wallpaper.author && <p className="mt-1 text-sm text-muted-foreground">by {wallpaper.author}</p>}
              <Separator className="my-4" />
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Resolution</span><Badge variant="outline">{wallpaper.resolution}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Dimensions</span><span>{wallpaper.width} x {wallpaper.height}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Orientation</span><span className="capitalize">{wallpaper.orientation}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Downloads</span><span>{wallpaper.downloads_count.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Likes</span><span>{wallpaper.likes_count.toLocaleString()}</span></div>
              </div>
              {wallpaper.tags && wallpaper.tags.length > 0 && (<><Separator className="my-4" /><div className="flex flex-wrap gap-1.5">{wallpaper.tags.map((tag) => (<Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>))}</div></>)}
              {wallpaper.dominant_color && (<><Separator className="my-4" /><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Color</span><div className="h-6 w-6 rounded-full border border-border" style={{ backgroundColor: wallpaper.dominant_color }} /><span className="text-xs font-mono text-muted-foreground">{wallpaper.dominant_color}</span></div></>)}
              <div className="mt-auto pt-6 space-y-2">
                {onSetWallpaper && <Button className="w-full bg-gradient-to-r from-amber-100 via-rose-50 to-amber-100 text-black border border-amber-200/50 hover:from-amber-200 hover:via-rose-100 hover:to-amber-200 dark:bg-gradient-to-r dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 dark:text-white dark:border-zinc-800 dark:hover:from-zinc-800 dark:hover:via-zinc-900 dark:hover:to-zinc-800 shadow-sm" onClick={() => onSetWallpaper(wallpaper)}>Set as Wallpaper</Button>}
                <div className="flex gap-2">
                  {onFavorite && <Button variant="outline" className="flex-1" onClick={() => onFavorite(wallpaper)}><Heart className={cn("mr-2 h-4 w-4", isFavorited && "fill-red-500 text-red-500")} />{isFavorited ? "Favorited" : "Favorite"}</Button>}
                  {onDownload && <Button variant="outline" className="flex-1" onClick={() => onDownload(wallpaper)}><Download className="mr-2 h-4 w-4" />Download</Button>}
                </div>
                {wallpaper.source_url && <Button variant="ghost" className="w-full text-xs" asChild><a href={wallpaper.source_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-3 w-3" />View Source</a></Button>}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
