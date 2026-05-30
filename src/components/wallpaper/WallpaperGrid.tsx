import { useRef, useCallback } from "react";
import Masonry from "react-masonry-css";
import { motion } from "motion/react";
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WallpaperCard } from "./WallpaperCard";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import type { Wallpaper } from "@/types/database";

const breakpointColumns = {
  default: 6,
  1800: 6,
  1500: 5,
  1200: 4,
  900: 3,
  640: 2,
  420: 1,
};

const skeletonHeights = [260, 340, 220, 420, 300, 380, 240, 460, 310, 360, 280, 400];

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  onPreview: (wallpaper: Wallpaper, originRect: DOMRect) => void;
  onFavorite?: (wallpaper: Wallpaper) => void;
  onDownload?: (wallpaper: Wallpaper) => void | Promise<void>;
  onSetWallpaper?: (wallpaper: Wallpaper) => void;
  onRemoveFromCollection?: (wallpaper: Wallpaper) => void;
  favorites?: Set<number>;
  useMasonrySizing?: boolean;
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
  onRemoveFromCollection,
  favorites,
  useMasonrySizing = true,
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
        className="masonry-grid pinterest-masonry-grid"
        columnClassName="masonry-column pinterest-masonry-column overflow-visible"
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <Skeleton
            key={i}
            className="rounded-xl"
            style={{ height: skeletonHeights[i % skeletonHeights.length] }}
          />
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
    <motion.div variants={staggerContainer(0.025)} initial="hidden" animate="visible">
      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid pinterest-masonry-grid"
        columnClassName="masonry-column pinterest-masonry-column overflow-visible"
      >
        {wallpapers.map((wallpaper, index) => (
          <motion.div key={wallpaper.id} variants={fadeInUp}>
            <WallpaperCard
              wallpaper={wallpaper}
              index={index}
              useMasonrySizing={useMasonrySizing}
              onPreview={onPreview}
              onFavorite={onFavorite}
              onDownload={onDownload}
              onSetWallpaper={onSetWallpaper}
              onRemoveFromCollection={onRemoveFromCollection}
              isFavorited={favorites?.has(wallpaper.id) ?? false}
            />
          </motion.div>
        ))}
      </Masonry>

      {hasNextPage && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <Masonry
              breakpointCols={breakpointColumns}
              className="masonry-grid pinterest-masonry-grid w-full"
              columnClassName="masonry-column pinterest-masonry-column overflow-visible"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="rounded-xl"
                  style={{ height: skeletonHeights[i % skeletonHeights.length] }}
                />
              ))}
            </Masonry>
          )}
        </div>
      )}
    </motion.div>
  );
}