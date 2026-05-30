import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import {
  X,
  Heart,
  Download,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  ImageOff,
  Grid3X3,
  TreePine,
  Sparkles,
  Minus,
  Moon,
  Palette,
  Building2,
  Rocket,
  Bird,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useWallpapers } from "@/hooks/useWallpapers";
import { cardHover } from "@/lib/motion";
import type { Category, Wallpaper } from "@/types/database";

const ICON_MAP: Record<string, React.ElementType> = {
  TreePine, Sparkles, Minus, Moon, Palette, Building2, Rocket, Bird, Grid3X3,
};

interface CategoryDialogProps {
  category: Category;
  onClose: () => void;
  onPreview?: (wallpaper: Wallpaper) => void;
  onFavorite?: (wallpaper: Wallpaper) => void;
  onDownload?: (wallpaper: Wallpaper) => void;
  onSetWallpaper?: (wallpaper: Wallpaper) => void;
  favorites?: Set<number>;
}

// ─── Carousel Card ───────────────────────────────────────────────────────────
function CarouselCard({
  wallpaper,
  position,
  onClick,
}: {
  wallpaper: Wallpaper;
  position: number; // -2..+2 relative to active
  onClick: () => void;
}) {
  const absPos = Math.abs(position);
  const rotateY = position * 35;
  const translateZ = absPos === 0 ? 120 : absPos === 1 ? 40 : -20;
  const scale = absPos === 0 ? 1 : absPos === 1 ? 0.8 : 0.65;
  const opacity = absPos === 0 ? 1 : absPos === 1 ? 0.7 : 0.35;
  const zIndex = 10 - absPos;
  const blur = absPos >= 2 ? 2 : 0;

  const img = wallpaper.thumbnail_url_large ?? wallpaper.thumbnail_url_medium ?? wallpaper.image_url;

  return (
    <motion.div
      animate={{
        rotateY,
        z: translateZ,
        scale,
        opacity,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      onClick={onClick}
      className="absolute left-1/2 top-0 cursor-pointer"
      style={{
        width: 340,
        height: 200,
        marginLeft: -170,
        zIndex,
        filter: blur ? `blur(${blur}px)` : undefined,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="h-full w-full overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
        <img
          src={img}
          alt={wallpaper.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="truncate text-sm font-medium text-white">{wallpaper.title}</p>
          <Badge
            variant="secondary"
            className="mt-1 bg-white/20 text-xs text-white backdrop-blur-md border-0"
          >
            {wallpaper.resolution}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Hero 3D Carousel ────────────────────────────────────────────────────────
function HeroCarousel({
  wallpapers,
  onPreview,
}: {
  wallpapers: Wallpaper[];
  onPreview: (w: Wallpaper) => void;
}) {
  const count = Math.min(5, wallpapers.length);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 3000);
  }, [count]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const go = (dir: number) => {
    setActiveIndex((prev) => (prev + dir + count) % count);
    resetTimer();
  };

  if (count === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl bg-muted/50">
        <ImageOff className="h-10 w-10 text-muted-foreground" />
      </div>
    );
  }

  const featured = wallpapers.slice(0, count);

  return (
    <div className="relative" style={{ perspective: 800 }}>
      <div className="relative mx-auto" style={{ width: 340, height: 200, transformStyle: "preserve-3d" }}>
        {featured.map((wp, i) => {
          let offset = i - activeIndex;
          // wrap around
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          return (
            <CarouselCard
              key={wp.id}
              wallpaper={wp}
              position={offset}
              onClick={() => {
                if (offset === 0) onPreview(wp);
                else {
                  setActiveIndex(i);
                  resetTimer();
                }
              }}
            />
          );
        })}
      </div>

      {/* Nav arrows */}
      <button
        onClick={() => go(-1)}
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition hover:bg-black/60"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition hover:bg-black/60"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveIndex(i);
              resetTimer();
            }}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === activeIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Ribbon Row ──────────────────────────────────────────────────────────────
function RibbonRow({
  title,
  icon: Icon,
  accentColor,
  wallpapers,
  aspectRatio,
  onPreview,
  onFavorite,
  onDownload,
  onSetWallpaper,
  favorites,
}: {
  title: string;
  icon: React.ElementType;
  accentColor: string;
  wallpapers: Wallpaper[];
  aspectRatio: string;
  onPreview: (w: Wallpaper) => void;
  onFavorite?: (w: Wallpaper) => void;
  onDownload?: (w: Wallpaper) => void;
  onSetWallpaper?: (w: Wallpaper) => void;
  favorites?: Set<number>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (wallpapers.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold tracking-wide">{title}</h3>
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${accentColor}40, transparent)` }} />
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {wallpapers.map((wp) => {
          const img = wp.thumbnail_url_medium ?? wp.image_url;
          const isFav = favorites?.has(wp.id) ?? false;
          return (
            <motion.div
              key={wp.id}
              {...cardHover}
              className="group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-xl"
              style={{ width: aspectRatio === "16/9" ? 240 : 140, aspectRatio }}
              onClick={() => onPreview(wp)}
            >
              <img
                src={img}
                alt={wp.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              >
                <div className="absolute right-2 top-2 flex gap-1.5">
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); onFavorite?.(wp); }}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md",
                      isFav ? "bg-red-500/90 text-white" : "bg-white/20 text-white hover:bg-white/30"
                    )}
                  >
                    <Heart className="h-3.5 w-3.5" fill={isFav ? "currentColor" : "none"} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); onDownload?.(wp); }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); onSetWallpaper?.(wp); }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/90 text-white backdrop-blur-md hover:bg-blue-600/90"
                    title="Set as Desktop Wallpaper"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="truncate text-xs font-medium text-white">{wp.title}</p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Masonry Footer ──────────────────────────────────────────────────────────
function MasonryFooter({
  wallpapers,
  onPreview,
  onFavorite,
  onDownload,
  onSetWallpaper,
  favorites,
  accentColor,
}: {
  wallpapers: Wallpaper[];
  onPreview: (w: Wallpaper) => void;
  onFavorite?: (w: Wallpaper) => void;
  onDownload?: (w: Wallpaper) => void;
  onSetWallpaper?: (w: Wallpaper) => void;
  favorites?: Set<number>;
  accentColor: string;
}) {
  if (wallpapers.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold tracking-wide">All Wallpapers</h3>
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${accentColor}40, transparent)` }} />
        <Badge variant="secondary" className="text-xs">{wallpapers.length}</Badge>
      </div>

      <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
        {wallpapers.map((wp, i) => {
          const img = wp.thumbnail_url_medium ?? wp.image_url;
          const isFav = favorites?.has(wp.id) ?? false;
          const aspect = wp.width / wp.height;

          return (
            <motion.div
              key={wp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              {...cardHover}
              className="group relative mb-3 cursor-pointer break-inside-avoid overflow-hidden rounded-xl"
              style={{ aspectRatio: aspect }}
              onClick={() => onPreview(wp)}
            >
              <img
                src={img}
                alt={wp.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              >
                <div className="absolute right-2 top-2 flex gap-1.5">
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); onFavorite?.(wp); }}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md",
                      isFav ? "bg-red-500/90 text-white" : "bg-white/20 text-white hover:bg-white/30"
                    )}
                  >
                    <Heart className="h-3.5 w-3.5" fill={isFav ? "currentColor" : "none"} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); onDownload?.(wp); }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); onSetWallpaper?.(wp); }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/90 text-white backdrop-blur-md hover:bg-blue-600/90"
                    title="Set as Desktop Wallpaper"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="truncate text-xs font-medium text-white">{wp.title}</p>
                  <Badge variant="secondary" className="mt-1 bg-white/20 text-[10px] text-white backdrop-blur-md border-0">
                    {wp.resolution}
                  </Badge>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Dialog ─────────────────────────────────────────────────────────────
export function CategoryDialog({
  category,
  onClose,
  onPreview,
  onFavorite,
  onDownload,
  onSetWallpaper,
  favorites,
}: CategoryDialogProps) {
  const { data, isLoading } = useWallpapers({ category_id: category.id });
  const wallpapers = data?.pages.flatMap((p) => p) ?? [];

  const Icon = ICON_MAP[category.icon || ""] || Grid3X3;

  // Split wallpapers into sections
  const featured = wallpapers.filter((w) => w.is_featured);
  const heroWallpapers = featured.length >= 5 ? featured : wallpapers;
  const popular = [...wallpapers].sort((a, b) => b.downloads_count - a.downloads_count).slice(0, 12);
  const recent = [...wallpapers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 12);

  // For masonry footer, exclude what's already shown in hero
  const heroIds = new Set(heroWallpapers.slice(0, 5).map((w) => w.id));
  const masonryWallpapers = wallpapers.filter((w) => !heroIds.has(w.id));

  // Keyboard escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handlePreview = onPreview ?? (() => {});

  return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/60"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1],
          }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          {/* ── Gradient Banner ─────────────────────────────────── */}
          <div
            className="relative flex-shrink-0 px-6 pb-4 pt-6"
            style={{
              background: `linear-gradient(135deg, ${category.color || "#6366f1"}30, ${category.color || "#6366f1"}10, transparent)`,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${category.color || "#6366f1"}25` }}
              >
                <Icon className="h-7 w-7" style={{ color: category.color || "#6366f1" }} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold tracking-tight">{category.name}</h2>
                {category.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{category.description}</p>
                )}
              </div>
              <Badge
                variant="secondary"
                className="text-sm"
                style={{ backgroundColor: `${category.color || "#6366f1"}20`, color: category.color || "#6366f1" }}
              >
                {category.wallpaper_count} wallpaper{category.wallpaper_count !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Close button */}
            <motion.button
              whileHover={{ rotate: 90 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-foreground backdrop-blur-md transition-colors hover:bg-black/40"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          {/* ── Scrollable Content ──────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 pb-8 pt-2">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-56 w-full rounded-xl" />
                <div className="flex gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-36 flex-shrink-0 rounded-xl" style={{ width: 240 }} />
                  ))}
                </div>
                <div className="columns-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="mb-3 h-40 rounded-xl" />
                  ))}
                </div>
              </div>
            ) : wallpapers.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div className="rounded-2xl bg-muted p-6">
                  <ImageOff className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">No wallpapers yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This category is waiting for its first wallpaper.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Section A: Hero 3D Carousel */}
                <section>
                  <HeroCarousel wallpapers={heroWallpapers} onPreview={handlePreview} />
                </section>

                {/* Section B: Ribbon Rows */}
                <section className="space-y-6">
                  <RibbonRow
                    title="Most Popular"
                    icon={Flame}
                    accentColor={category.color || "#ef4444"}
                    wallpapers={popular}
                    aspectRatio="16/9"
                    onPreview={handlePreview}
                    onFavorite={onFavorite}
                    onDownload={onDownload}
                    onSetWallpaper={onSetWallpaper}
                    favorites={favorites}
                  />
                  <RibbonRow
                    title="Recently Added"
                    icon={Clock}
                    accentColor={category.color || "#6366f1"}
                    wallpapers={recent}
                    aspectRatio="9/16"
                    onPreview={handlePreview}
                    onFavorite={onFavorite}
                    onDownload={onDownload}
                    onSetWallpaper={onSetWallpaper}
                    favorites={favorites}
                  />
                </section>

                {/* Section C: Masonry Footer */}
                <section>
                  <MasonryFooter
                    wallpapers={masonryWallpapers}
                    onPreview={handlePreview}
                    onFavorite={onFavorite}
                    onDownload={onDownload}
                    onSetWallpaper={onSetWallpaper}
                    favorites={favorites}
                    accentColor={category.color || "#6366f1"}
                  />
                </section>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
  );
}
