import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { invoke } from "@tauri-apps/api/core";
import { Search, X, SlidersHorizontal, ChevronLeft, ChevronRight, Heart, Download, Monitor } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid";
import { WallpaperPreview } from "@/components/wallpaper/WallpaperPreview";
import { useWallpapers, useFeaturedWallpapers, useCategories, type WallpaperFilters } from "@/hooks/useWallpapers";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useAppStore } from "@/stores/appStore";
import { useToastStore } from "@/stores/toastStore";
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
  const [resolution, setResolution] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<string | null>(null);
  const [sort, setSort] = useState<WallpaperFilters["sort"]>("created_at");
  const [showFilters, setShowFilters] = useState(false);
  const [previewWallpaper, setPreviewWallpaper] = useState<Wallpaper | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Use real stores instead of local state
  const { selectedCategoryId, setSelectedCategoryId } = useAppStore();
  const categoryId = selectedCategoryId;
  const setCategoryId = useCallback((id: number | null) => setSelectedCategoryId(id), [setSelectedCategoryId]);

  const addToast = useToastStore((s) => s.addToast);
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorited = useCallback((id: number) => favoriteIds.has(id), [favoriteIds]);

  const { data: categories } = useCategories();
  const { data: featured } = useFeaturedWallpapers();

  const filters: WallpaperFilters = useMemo(
    () => ({ category_id: categoryId, resolution, orientation, sort, search: debouncedSearch || null }),
    [categoryId, resolution, orientation, sort, debouncedSearch]
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useWallpapers(filters);
  const wallpapers = useMemo(() => data?.pages.flatMap((p) => p) ?? [], [data]);

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
  }, [setCategoryId]);

  const hasActiveFilters = categoryId || resolution || orientation || sort !== "created_at" || debouncedSearch;

  // Handle set wallpaper via Tauri
  const [settingWallpaper, setSettingWallpaper] = useState(false);

  const handleSetWallpaper = useCallback(async (wallpaper: Wallpaper) => {
    if (settingWallpaper) return;
    setSettingWallpaper(true);
    try {
      const cachePath = await invoke<string>("download_and_cache", { url: wallpaper.image_url });
      await invoke("set_wallpaper", { path: cachePath });
      addToast("Wallpaper set successfully!", "success");
    } catch (err) {
      console.error("Failed to set wallpaper:", err);
      addToast("Failed to set wallpaper", "error");
    } finally {
      setSettingWallpaper(false);
    }
  }, [settingWallpaper, addToast]);

  const handleDownload = useCallback(async (wallpaper: Wallpaper) => {
    try {
      await invoke<string>("download_and_cache", { url: wallpaper.image_url });
      addToast(`Downloaded: ${wallpaper.title}`, "success");
    } catch (err) {
      console.error("Failed to download wallpaper:", err);
      addToast("Download failed", "error");
    }
  }, [addToast]);

  const handleFavorite = useCallback((wallpaper: Wallpaper) => {
    toggleFavorite(wallpaper.id);
  }, [toggleFavorite]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number>();
  const isManualScrolling = useRef(false);
  const isHovering = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Triple featured array for seamless infinite loop
  const tripledFeatured = useMemo(() => {
    if (!featured || featured.length === 0) return [];
    return [...featured, ...featured, ...featured];
  }, [featured]);

  const CARD_W = 384; // w-96
  const GAP = 12;     // gap-3

  // On mount, scroll to the middle set
  useEffect(() => {
    if (scrollRef.current && featured && featured.length > 0) {
      scrollRef.current.scrollLeft = featured.length * (CARD_W + GAP);
    }
  }, [featured]);

  // Auto-scroll with delta-time for frame-rate independent speed
  useEffect(() => {
    if (!featured || featured.length === 0) return;
    const el = scrollRef.current;
    if (!el) return;

    const SPEED = 40; // px per second
    const loopLength = featured.length * (CARD_W + GAP);
    let lastTime: number | null = null;

    const animate = (time: number) => {
      if (lastTime !== null && !isManualScrolling.current && !isHovering.current) {
        const dt = (time - lastTime) / 1000;
        el.scrollLeft += SPEED * dt;
        if (el.scrollLeft >= loopLength * 2) {
          el.scrollLeft -= loopLength;
        }
      }
      lastTime = time;
      autoScrollRef.current = requestAnimationFrame(animate);
    };

    autoScrollRef.current = requestAnimationFrame(animate);
    return () => {
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
    };
  }, [featured]);

  const scrollFeatured = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    isManualScrolling.current = true;
    scrollRef.current.scrollBy({ left: dir === "left" ? -(CARD_W + GAP) : CARD_W + GAP, behavior: "smooth" });
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => { isManualScrolling.current = false; }, 600);
  };

  return (
    <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible" className="flex h-full flex-col gap-6 p-6">
      {/* Featured carousel */}
      {featured && featured.length > 0 && (
        <motion.div variants={fadeInUp} className="relative">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Featured</h2>
            <div className="flex gap-2">
              <button onClick={() => scrollFeatured("left")} className="flex h-10 w-10 items-center justify-center rounded-full glass-subtle cursor-pointer transition-all hover:scale-105 hover:bg-white/20 active:scale-95"><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={() => scrollFeatured("right")} className="flex h-10 w-10 items-center justify-center rounded-full glass-subtle cursor-pointer transition-all hover:scale-105 hover:bg-white/20 active:scale-95"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
          <div ref={scrollRef} className="group flex gap-3 overflow-hidden pb-2 scrollbar-hide" onMouseEnter={() => { isHovering.current = true; }} onMouseLeave={() => { isHovering.current = false; }}>
            {tripledFeatured.map((wp, idx) => (
              <div key={`${wp.id}-${idx}`} onClick={() => setPreviewWallpaper(wp)} className="group/card relative h-56 w-96 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl">
                <img src={wp.thumbnail_url_medium ?? wp.image_url} alt={wp.title} className="h-full w-full object-cover transition-transform duration-[400ms] group-hover/card:scale-100 scale-[1.07]" style={{ transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }} loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-2 left-3 text-sm font-medium text-white">{wp.title}</p>
                {/* Action buttons on hover */}
                <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleFavorite(wp); }} title={isFavorited(wp.id) ? "Remove from Favorites" : "Add to Favorites"} className={cn("flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md", isFavorited(wp.id) ? "bg-red-500/90 text-white" : "bg-white/20 text-white hover:bg-white/30")}>
                    <Heart className={cn("h-4 w-4", isFavorited(wp.id) && "fill-white")} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleDownload(wp); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30" title="Download">
                    <Download className="h-4 w-4" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleSetWallpaper(wp); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/90 text-white backdrop-blur-md hover:bg-blue-600/90" title="Set as Wallpaper">
                    <Monitor className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search and filters */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search wallpapers..." value={search} onChange={(e) => handleSearchChange(e.target.value)} className="pl-9 pr-9" />
            {search && <button onClick={() => handleSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
          <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(!showFilters)} className="gap-2"><SlidersHorizontal className="h-4 w-4" />Filters</Button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <Badge variant={categoryId === null ? "default" : "outline"} className="cursor-pointer whitespace-nowrap" onClick={() => setCategoryId(null)}>All</Badge>
          {categories?.map((cat) => (
            <Badge key={cat.id} variant={categoryId === cat.id ? "default" : "outline"} className="cursor-pointer whitespace-nowrap" onClick={() => setCategoryId(categoryId === cat.id ? null : cat.id)}>
              {cat.name}{cat.wallpaper_count > 0 && <span className="ml-1 opacity-60">{cat.wallpaper_count}</span>}
            </Badge>
          ))}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-wrap gap-6 rounded-lg border border-border bg-card p-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Resolution</p>
              <div className="flex gap-1.5">{RESOLUTIONS.map((r) => <Badge key={r} variant={resolution === r ? "default" : "outline"} className="cursor-pointer" onClick={() => setResolution(resolution === r ? null : r)}>{r}</Badge>)}</div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Orientation</p>
              <div className="flex gap-1.5">{ORIENTATIONS.map((o) => <Badge key={o} variant={orientation === o ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setOrientation(orientation === o ? null : o)}>{o}</Badge>)}</div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Sort By</p>
              <div className="flex gap-1.5">{SORT_OPTIONS.map((opt) => <Badge key={opt.value} variant={sort === opt.value ? "default" : "outline"} className="cursor-pointer" onClick={() => setSort(opt.value)}>{opt.label}</Badge>)}</div>
            </div>
            {hasActiveFilters && <div className="flex items-end"><Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">Clear all</Button></div>}
          </motion.div>
        )}
      </motion.div>

      {/* Masonry grid */}
      <motion.div variants={fadeInUp} className="flex-1">
        <WallpaperGrid wallpapers={wallpapers} isLoading={isLoading} isFetchingNextPage={isFetchingNextPage} hasNextPage={hasNextPage} fetchNextPage={fetchNextPage} onPreview={setPreviewWallpaper} onFavorite={handleFavorite} onDownload={handleDownload} onSetWallpaper={handleSetWallpaper} favorites={favoriteIds} />
      </motion.div>

      {/* Preview modal with all actions connected */}
      <WallpaperPreview wallpaper={previewWallpaper} onClose={() => setPreviewWallpaper(null)} isFavorited={previewWallpaper ? isFavorited(previewWallpaper.id) : false} onFavorite={handleFavorite} onSetWallpaper={handleSetWallpaper} />
    </motion.div>
  );
}
