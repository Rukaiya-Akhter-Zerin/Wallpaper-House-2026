import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, Monitor, ChevronLeft, ChevronRight, TrendingUp, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWallpapers } from "@/hooks/useWallpapers";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useToastStore } from "@/stores/toastStore";
import { invoke } from "@tauri-apps/api/core";
import { WallpaperPreview } from "@/components/wallpaper/WallpaperPreview";
import { DownloadCircleButton } from "@/components/wallpaper/DownloadCircleButton";
import type { Category, Wallpaper } from "@/types/database";

interface CategoryDialogProps {
  category: Category;
  onClose: () => void;
  onPreview: (wallpaper: Wallpaper) => void;
}

export function CategoryDialog({ category, onClose }: CategoryDialogProps) {
  const { data } = useWallpapers({ category_id: category.id });
  const wallpapers = useMemo(() => data?.pages.flatMap(p => p) ?? [], [data]);
  const favoriteIds = useFavoritesStore(s => s.favoriteIds);
  const toggleFavorite = useFavoritesStore(s => s.toggleFavorite);
  const addToast = useToastStore(s => s.addToast);

  const [previewWallpaper, setPreviewWallpaper] = useState<Wallpaper | null>(null);
  const [previewOrigin, setPreviewOrigin] = useState<DOMRect | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(() => new Set());

  /* ── Infinite carousel ── */
  const carouselItems = wallpapers.slice(0, 5);
  const tripledCarousel = useMemo(() => [...carouselItems, ...carouselItems, ...carouselItems], [carouselItems]);
  const [carouselIndex, setCarouselIndex] = useState(carouselItems.length);

  useEffect(() => {
    if (carouselItems.length === 0) return;
    const timer = setInterval(() => setCarouselIndex(i => i + 1), 3000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  const scrollCarousel = useCallback((dir: number) => setCarouselIndex(i => i + dir), []);

  const popularItems = wallpapers.slice(0, 8);
  const recentItems = wallpapers.slice(0, 8);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSetWallpaper = async (wp: Wallpaper, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const cachePath = await invoke<string>("download_and_cache", { url: wp.image_url });
      await invoke("set_wallpaper", { path: cachePath });
      addToast("Wallpaper set!", "success");
    } catch { addToast("Failed to set wallpaper", "error"); }
  };

  const handleDownload = async (wp: Wallpaper, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (downloadingIds.has(wp.id)) return;
    setDownloadingIds((ids) => new Set(ids).add(wp.id));
    try {
      await invoke<string>("download_wallpaper", { wallpaperId: wp.id, url: wp.image_url, title: wp.title });
      addToast(`Downloaded to Downloads/Walpaper-House-2026: ${wp.title}`, "success");
    } catch {
      addToast("Download failed", "error");
    } finally {
      setDownloadingIds((ids) => {
        const next = new Set(ids);
        next.delete(wp.id);
        return next;
      });
    }
  };

  const ActionButtons = ({ wp, vertical }: { wp: Wallpaper; vertical?: boolean }) => (
    <div className={cn("absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100", vertical ? "flex flex-col gap-1.5" : "flex gap-1.5")}>
      <button onClick={e => { e.stopPropagation(); toggleFavorite(wp.id); }} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30">
        <Heart className={cn("h-3.5 w-3.5", favoriteIds.has(wp.id) && "fill-red-500 text-red-500")} />
      </button>
      <DownloadCircleButton
        wallpaperId={wp.id}
        active={downloadingIds.has(wp.id)}
        onClick={e => handleDownload(wp, e)}
        size={28}
        iconSize="h-3.5 w-3.5"
        title={downloadingIds.has(wp.id) ? "Downloading..." : "Download"}
      />
      <button onClick={e => handleSetWallpaper(wp, e)} className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/90 text-white backdrop-blur-md">
        <Monitor className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  return (
    <>
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mx-4 max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative border-b border-border px-4 py-4" style={{ background: `linear-gradient(135deg, ${category.color}15, transparent)` }}>
            <div className="flex items-center gap-4">
              <div className="rounded-xl p-3" style={{ backgroundColor: `${category.color}20` }}>
                <span className="text-2xl">{category.icon || "📁"}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{category.name}</h2>
                {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
              </div>
              <Badge variant="secondary" className="ml-auto">{wallpapers.length} wallpapers</Badge>
            </div>
            <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:rotate-90">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>

            {/* Section A: Infinite 3D Carousel */}
            {carouselItems.length > 0 && (
              <div className="border-b border-border px-4 py-4">
                <h3 className="mb-3 text-lg font-semibold">Featured</h3>
                <div className="relative flex items-center justify-center" style={{ perspective: "1000px", height: "340px" }}>
                  <button onClick={() => scrollCarousel(-1)} className="absolute left-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="relative flex items-center justify-center" style={{ width: "700px", height: "340px" }}>
                    {tripledCarousel.map((wp, i) => {
                      const offset = i - carouselIndex;
                      const isActive = offset === 0;
                      return (
                        <motion.div
                          key={`${wp.id}-${i}`}
                          animate={{ x: offset * 180, scale: isActive ? 1 : 0.8, rotateY: offset * -15, opacity: Math.abs(offset) > 2 ? 0 : 1, zIndex: isActive ? 50 : 10 - Math.abs(offset) }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute cursor-pointer overflow-hidden rounded-xl shadow-2xl"
                          style={{ width: "320px", height: "280px" }}
                          onClick={(e) => { const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); setPreviewWallpaper(wp); setPreviewOrigin(rect); }}
                        >
                          <img src={wp.thumbnail_url_large ?? wp.image_url} alt={wp.title} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <p className="absolute bottom-3 left-3 text-sm font-medium text-white">{wp.title}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                  <button onClick={() => scrollCarousel(1)} className="absolute right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Section B: Ribbon Rows — NO zoom, just hover overlay + tap for detail */}
            <div className="space-y-6 px-4 py-4">

              {/* Most Popular */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-400" />
                  <h3 className="font-semibold">Most Popular</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-orange-400/30 to-transparent" />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {popularItems.map(wp => (
                    <div key={wp.id} className="group relative h-36 w-64 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl" onClick={(e) => { const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); setPreviewWallpaper(wp); setPreviewOrigin(rect); }}>
                      <img src={wp.thumbnail_url_medium ?? wp.image_url} alt={wp.title} className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <ActionButtons wp={wp} />
                      <p className="absolute bottom-2 left-2 truncate text-xs font-medium text-white">{wp.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Added */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <h3 className="font-semibold">Recently Added</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-400/30 to-transparent" />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {recentItems.map(wp => (
                    <div key={wp.id} className="group relative h-52 w-36 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl" onClick={(e) => { const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); setPreviewWallpaper(wp); setPreviewOrigin(rect); }}>
                      <img src={wp.thumbnail_url_medium ?? wp.image_url} alt={wp.title} className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <ActionButtons wp={wp} vertical />
                      <p className="absolute bottom-2 left-2 right-2 truncate text-xs font-medium text-white">{wp.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor's Picks */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-400" />
                  <h3 className="font-semibold">Editor's Picks</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-purple-400/30 to-transparent" />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {popularItems.slice(0, 6).map(wp => (
                    <div key={wp.id} className="group relative h-40 w-40 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-purple-500/20" onClick={(e) => { const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); setPreviewWallpaper(wp); setPreviewOrigin(rect); }}>
                      <img src={wp.thumbnail_url_medium ?? wp.image_url} alt={wp.title} className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="truncate text-xs font-bold text-white">{wp.title}</p>
                      </div>
                      <ActionButtons wp={wp} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section C: Masonry footer */}
            {wallpapers.length > 5 && (
              <div className="border-t border-border px-4 py-4">
                <h3 className="mb-4 font-semibold">All {category.name} Wallpapers</h3>
                <div className="columns-2 gap-2 md:columns-3 lg:columns-4">
                  {wallpapers.map((wp, i) => (
                    <div key={wp.id} className="group relative mb-2 break-inside-avoid cursor-pointer overflow-hidden rounded-xl" onClick={(e) => { const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); setPreviewWallpaper(wp); setPreviewOrigin(rect); }}>
                      <img src={wp.thumbnail_url_medium ?? wp.image_url} alt={wp.title} className="w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={e => { e.stopPropagation(); toggleFavorite(wp.id); }} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30">
                          <Heart className={cn("h-3.5 w-3.5", favoriteIds.has(wp.id) && "fill-red-500 text-red-500")} />
                        </button>
                        <DownloadCircleButton
                          wallpaperId={wp.id}
                          active={downloadingIds.has(wp.id)}
                          onClick={e => handleDownload(wp, e)}
                          size={28}
                          iconSize="h-3.5 w-3.5"
                          title={downloadingIds.has(wp.id) ? "Downloading..." : "Download"}
                        />
                        <button onClick={e => handleSetWallpaper(wp, e)} className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/90 text-white backdrop-blur-md">
                          <Monitor className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="absolute bottom-2 left-2 truncate text-xs font-medium text-white opacity-0 group-hover:opacity-100">{wp.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>

    {/* Detail preview modal — same as gallery */}
    <WallpaperPreview
      wallpaper={previewWallpaper}
      onClose={() => { setPreviewWallpaper(null); setPreviewOrigin(null); }}
      originRect={previewOrigin}
      isFavorited={previewWallpaper ? favoriteIds.has(previewWallpaper.id) : false}
      onFavorite={(wp) => toggleFavorite(wp.id)}
      onDownload={(wp) => handleDownload(wp)}
      onSetWallpaper={(wp) => handleSetWallpaper(wp)}
    />
    </>
  );
}
