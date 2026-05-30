import { useRef, useCallback, useMemo, useEffect, useState } from "react";
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

const masonryAspectPattern = [0.72, 0.84, 0.64, 0.92, 0.76, 0.68, 0.88, 0.58, 0.8, 0.7, 0.96, 0.62];
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

function getColumnCount(width: number) {
  if (width <= 420) return 1;
  if (width <= 640) return 2;
  if (width <= 900) return 3;
  if (width <= 1200) return 4;
  if (width <= 1500) return 5;
  return 6;
}

function useResponsiveColumnCount() {
  const [columnCount, setColumnCount] = useState(() =>
    typeof window === "undefined" ? breakpointColumns.default : getColumnCount(window.innerWidth)
  );

  useEffect(() => {
    const update = () => setColumnCount(getColumnCount(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return columnCount;
}

function estimateCardHeight(wallpaper: Wallpaper, index: number, useMasonrySizing: boolean) {
  const aspectRatio = useMasonrySizing
    ? masonryAspectPattern[index % masonryAspectPattern.length]
    : wallpaper.width && wallpaper.height
      ? wallpaper.width / wallpaper.height
      : 16 / 10;

  return 1 / Math.max(aspectRatio, 0.35);
}

function buildBalancedColumns(wallpapers: Wallpaper[], columnCount: number, useMasonrySizing: boolean) {
  const columns = Array.from({ length: columnCount }, () => [] as Array<{ wallpaper: Wallpaper; index: number }>);
  const heights = Array.from({ length: columnCount }, () => 0);

  wallpapers.forEach((wallpaper, index) => {
    let shortestColumn = 0;
    for (let i = 1; i < columnCount; i += 1) {
      if (heights[i] < heights[shortestColumn]) shortestColumn = i;
    }

    columns[shortestColumn].push({ wallpaper, index });
    heights[shortestColumn] += estimateCardHeight(wallpaper, index, useMasonrySizing) + 0.055;
  });

  return columns;
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
  const columnCount = useResponsiveColumnCount();
  const balancedColumns = useMemo(
    () => buildBalancedColumns(wallpapers, columnCount, useMasonrySizing),
    [wallpapers, columnCount, useMasonrySizing]
  );

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
      <div className="masonry-grid pinterest-masonry-grid items-start">
        {balancedColumns.map((column, columnIndex) => (
          <div key={columnIndex} className="masonry-column pinterest-masonry-column flex-1 overflow-visible">
            {column.map(({ wallpaper, index }) => (
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
          </div>
        ))}
      </div>

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
