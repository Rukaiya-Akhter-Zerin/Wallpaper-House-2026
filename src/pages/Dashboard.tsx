import { useState, useCallback, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { Search, X, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid";
import { WallpaperPreview } from "@/components/wallpaper/WallpaperPreview";
import {
  useWallpapers,
  useFeaturedWallpapers,
  useCategories,
  type WallpaperFilters,
} from "@/hooks/useWallpapers";
import type { Wallpaper } from "@/types/database";

const RESOLUTIONS = ["4K", "2K", "1080p", "Ultrawide"];
const ORIENTATIONS = ["landscape", "portrait", "square"];
const SORT_OPTIONS = [
  { value: "created_at" as const, label: "Newest" },
  { value: "downloads_count" as const, label: "Popular" },
  { value: "likes_count" as const, label: "Most Liked" },
];

export function Dashboard() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [resolution, setResolution] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<string | null>(null);
  const [sort, setSort] = useState<WallpaperFilters["sort"]>("created_at");
  const [showFilters, setShowFilters] = useState(false);
  const [previewWallpaper, setPreviewWallpaper] = useState<Wallpaper | null>(null);
  const [favorites] = useState<Set<number>>(new Set());
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { data: categories } = useCategories();
  const { data: featured } = useFeaturedWallpapers();

  const filters: WallpaperFilters = useMemo(
    () => ({
      category_id: categoryId,
      resolution,
      orientation,
      sort,
      search: debouncedSearch || null,
    }),
    [categoryId, resolution, orientation, sort, debouncedSearch]
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useWallpapers(filters);

  const wallpapers = useMemo(
    () => data?.pages.flatMap((p) => p) ?? [],
    [data]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  const clearFilters = useCallback(() => {
    setCategoryId(null);
    setResolution(null);
    setOrientation(null);
    setSort("created_at");
    setSearch("");
    setDebouncedSearch("");
  }, []);

  const hasActiveFilters = categoryId || resolution || orientation || sort !== "created_at" || debouncedSearch;

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollFeatured = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
  };

  return (
    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col gap-6 p-6"
    >
      {/* Featured carousel */}
      {featured && featured.length > 0 && (
        <motion.div variants={fadeInUp} className="relative">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Featured</h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => scrollFeatured("left")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => scrollFeatured("right")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {featured.map((wp) => (
              <motion.div
                key={wp.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPreviewWallpaper(wp)}
                className="relative h-40 w-64 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl"
              >
                <img
                  src={wp.thumbnail_url_medium ?? wp.image_url}
                  alt={wp.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-2 left-3 text-sm font-medium text-white">{wp.title}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search and filters bar */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search wallpapers..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <Badge
            variant={categoryId === null ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setCategoryId(null)}
          >
            All
          </Badge>
          {categories?.map((cat) => (
            <Badge
              key={cat.id}
              variant={categoryId === cat.id ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
            >
              {cat.name}
              {cat.wallpaper_count > 0 && (
                <span className="ml-1 opacity-60">{cat.wallpaper_count}</span>
              )}
            </Badge>
          ))}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-6 rounded-lg border border-border bg-card p-4"
          >
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Resolution</p>
              <div className="flex gap-1.5">
                {RESOLUTIONS.map((r) => (
                  <Badge
                    key={r}
                    variant={resolution === r ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setResolution(resolution === r ? null : r)}
                  >
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Orientation</p>
              <div className="flex gap-1.5">
                {ORIENTATIONS.map((o) => (
                  <Badge
                    key={o}
                    variant={orientation === o ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => setOrientation(orientation === o ? null : o)}
                  >
                    {o}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Sort By</p>
              <div className="flex gap-1.5">
                {SORT_OPTIONS.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant={sort === opt.value ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSort(opt.value)}
                  >
                    {opt.label}
                  </Badge>
                ))}
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  Clear all
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Masonry grid */}
      <motion.div variants={fadeInUp} className="flex-1">
        <WallpaperGrid
          wallpapers={wallpapers}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          onPreview={setPreviewWallpaper}
          favorites={favorites}
        />
      </motion.div>

      {/* Preview modal */}
      <WallpaperPreview
        wallpaper={previewWallpaper}
        onClose={() => setPreviewWallpaper(null)}
        isFavorited={previewWallpaper ? favorites.has(previewWallpaper.id) : false}
      />
    </motion.div>
  );
}
