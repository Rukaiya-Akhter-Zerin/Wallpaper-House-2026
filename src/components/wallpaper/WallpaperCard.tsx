import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Heart, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { cardHover, springConfigs } from "@/lib/motion";
import type { Wallpaper } from "@/types/database";

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  onPreview: (wallpaper: Wallpaper) => void;
  onFavorite?: (wallpaper: Wallpaper) => void;
  onDownload?: (wallpaper: Wallpaper) => void;
  isFavorited?: boolean;
  index?: number;
}

export function WallpaperCard({
  wallpaper,
  onPreview,
  onFavorite,
  onDownload,
  isFavorited = false,
}: WallpaperCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

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

  return (
    <motion.div
      {...cardHover}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onPreview(wallpaper)}
      className="group relative cursor-pointer overflow-hidden rounded-xl"
      style={{ aspectRatio }}
      layout
    >
      {!loaded && (
        <Skeleton className="absolute inset-0 h-full w-full rounded-xl" />
      )}

      <motion.img
        src={imageUrl}
        alt={wallpaper.title}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
      >
        <div className="absolute right-3 top-3 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavorite}
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
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
          >
            <Download className="h-4 w-4" />
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

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: hovered ? 1 : 0.8 }}
            transition={springConfigs.bouncy}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md"
          >
            <Eye className="h-5 w-5 text-white" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
