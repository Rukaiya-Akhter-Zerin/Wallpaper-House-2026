import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, Download, Maximize2, Minimize2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { springConfigs } from "@/lib/motion";
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
}

export function WallpaperPreview({ wallpaper, onClose, onFavorite, onDownload, onSetWallpaper, isFavorited = false, onNext, onPrev }: WallpaperPreviewProps) {
  const [zoomed, setZoomed] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") onNext?.();
    if (e.key === "ArrowLeft") onPrev?.();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    if (wallpaper) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => { document.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
  }, [wallpaper, handleKeyDown]);

  return (
    <AnimatePresence>
      {wallpaper && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={springConfigs.gentle} className="relative z-10 flex h-[90vh] w-[90vw] max-w-7xl overflow-hidden rounded-2xl bg-background/95 backdrop-blur-md border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black/5">
              <motion.img src={wallpaper.image_url} alt={wallpaper.title} className={cn("max-h-full max-w-full object-contain transition-transform duration-300", zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in")} onClick={() => setZoomed(z => !z)} draggable={false} />
              <button onClick={onClose} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70"><X className="h-5 w-5" /></button>
            </div>
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
                {onSetWallpaper && <Button className="w-full" onClick={() => onSetWallpaper(wallpaper)}>Set as Wallpaper</Button>}
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
