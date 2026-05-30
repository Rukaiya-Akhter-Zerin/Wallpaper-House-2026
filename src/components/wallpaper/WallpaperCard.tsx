import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Heart, Download, Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Wallpaper } from "@/types/database";

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  onPreview: (wallpaper: Wallpaper) => void;
  onFavorite?: (wallpaper: Wallpaper) => void;
  onDownload?: (wallpaper: Wallpaper) => void;
  onSetWallpaper?: (wallpaper: Wallpaper) => void;
  isFavorited?: boolean;
  index?: number;
}

export function WallpaperCard({
  wallpaper,
  onPreview,
  onFavorite,
  onDownload,
  onSetWallpaper,
  isFavorited = false,
}: WallpaperCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const imageUrl = wallpaper.thumbnail_url_medium ?? wallpaper.image_url;
  const aspectRatio = wallpaper.width / wallpaper.height;

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onFavorite?.(wallpaper);
    },
    [wallpaper, onFavorite]
  );

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDownload?.(wallpaper);
    },
    [wallpaper, onDownload]
  );

  const handleSetWallpaper = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSetWallpaper?.(wallpaper);
    },
    [wallpaper, onSetWallpaper]
  );

  return (
    /* Wrapper div — owns z-index for pop-out above sidebar */
    <div
      style={{
        overflow: "visible",
        position: "relative",
        willChange: "transform",
        zIndex: hovered ? 9999 : 1,
      }}
    >
      <motion.div
        onClick={() => onPreview(wallpaper)}
        onHoverStart={() => {
          hoverTimerRef.current = setTimeout(() => setHovered(true), 300);
        }}
        onHoverEnd={() => {
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          setHovered(false);
        }}
        animate={{
          scale: hovered ? 1.35 : 1,
          boxShadow: hovered
            ? "0 25px 80px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.15)"
            : "0 0 0 0 transparent",
        }}
        transition={{
          scale: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          boxShadow: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
        }}
        className="group cursor-pointer rounded-xl"
        style={{
          transformOrigin: "center center",
          willChange: "transform",
          position: "relative",
          overflow: "hidden",
          aspectRatio,
        }}
      >
        {!loaded && (
          <Skeleton className="absolute inset-0 h-full w-full rounded-xl" />
        )}

        <img
          src={imageUrl}
          alt={wallpaper.title}
          className={cn(
            "h-full w-full object-cover transition-transform duration-[400ms]",
            loaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            transform: hovered ? "scale(1)" : "scale(1.5)",
            transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onLoad={() => setLoaded(true)}
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="absolute right-3 top-3 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavorite}
              title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-colors",
                isFavorited
                  ? "bg-red-500/90 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              )}
            >
              <Heart className="h-4 w-4" fill={isFavorited ? "currentColor" : "none"} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              title="Download"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
            >
              <Download className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSetWallpaper}
              title="Set as Desktop Wallpaper"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/90 text-white backdrop-blur-md hover:bg-blue-600/90"
            >
              <Monitor className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="truncate text-sm font-medium text-white">{wallpaper.title}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-xs text-white backdrop-blur-md border-0">
                {wallpaper.resolution}
              </Badge>
              {wallpaper.author && (
                <span className="truncate text-xs text-white/70">{wallpaper.author}</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
