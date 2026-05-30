import { useRef, useCallback } from "react";
import Masonry from "react-masonry-css";
import { motion } from "motion/react";
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WallpaperCard } from "./WallpaperCard";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import type { Wallpaper } from "@/types/database";

const breakpointColumns = {
  default: 4,
  1440: 4,
  1024: 3,
  768: 2,
  500: 1,
};

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  onPreview: (wallpaper: Wallpaper) => void;
  onFavorite?: (wallpaper: Wallpaper) => void;
  onDownload?: (wallpaper: Wallpaper) => void;
  onSetWallpaper?: (wallpaper: Wallpaper) => void;
  favorites?: Set<number>;
}

export function WallpaperGrid({
  wallpapers,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onPreview,
  onFavorite,
  onDownload,
  onSetWallpaper,
  favorites,
}: WallpaperGridProps) {
  const observer = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage?.();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  if (isLoading) {
    return (
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex gap-2"
        columnClassName="flex flex-col gap-2 overflow-visible"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </Masonry>
    );
  }

  if (wallpapers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-4 py-20"
      >
        <div className="rounded-2xl bg-muted p-6">
          <ImageOff className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">No wallpapers found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={staggerContainer(0.04)} initial="hidden" animate="visible">
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex gap-2"
        columnClassName="flex flex-col gap-2 overflow-visible"
      >
        {wallpapers.map((wallpaper) => (
          <motion.div key={wallpaper.id} variants={fadeInUp}>
            <WallpaperCard
              wallpaper={wallpaper}
              onPreview={onPreview}
              onFavorite={onFavorite}
              onDownload={onDownload}
              onSetWallpaper={onSetWallpaper}
              isFavorited={favorites?.has(wallpaper.id) ?? false}
            />
          </motion.div>
        ))}
      </Masonry>

      {hasNextPage && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
