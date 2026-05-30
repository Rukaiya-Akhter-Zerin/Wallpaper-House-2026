import { useCallback, useState } from "react";
import { motion } from "motion/react";
import { invoke } from "@tauri-apps/api/core";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { Heart } from "lucide-react";
import { useFavoriteWallpapers, useFavorites } from "@/hooks/useFavorites";
import { Skeleton } from "@/components/ui/skeleton";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid";
import { WallpaperPreview } from "@/components/wallpaper/WallpaperPreview";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useToastStore } from "@/stores/toastStore";
import type { Wallpaper } from "@/types/database";

export function Favorites() {
  useFavorites();
  const { data: wallpapers, isLoading } = useFavoriteWallpapers();
  const [previewWallpaper, setPreviewWallpaper] = useState<Wallpaper | null>(null);
  const [previewOrigin, setPreviewOrigin] = useState<DOMRect | null>(null);
  const [settingWallpaper, setSettingWallpaper] = useState(false);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(() => new Set());

  const addToast = useToastStore((s) => s.addToast);
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorited = useCallback((id: number) => favoriteIds.has(id), [favoriteIds]);

  const handleFavorite = useCallback((wallpaper: Wallpaper) => {
    toggleFavorite(wallpaper.id);
  }, [toggleFavorite]);

  const handleDownload = useCallback(async (wallpaper: Wallpaper) => {
    if (downloadingIds.has(wallpaper.id)) return;
    setDownloadingIds((ids) => new Set(ids).add(wallpaper.id));
    try {
      await invoke<string>("download_wallpaper", {
        wallpaperId: wallpaper.id,
        url: wallpaper.image_url,
        title: wallpaper.title,
      });
      addToast(`Downloaded to Downloads/Walpaper-House-2026: ${wallpaper.title}`, "success");
    } catch (err) {
      console.error("Failed to download wallpaper:", err);
      addToast("Download failed", "error");
    } finally {
      setDownloadingIds((ids) => {
        const next = new Set(ids);
        next.delete(wallpaper.id);
        return next;
      });
    }
  }, [addToast, downloadingIds]);

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
  }, [addToast, settingWallpaper]);

  return (
    <motion.div
      variants={staggerContainer(0.06)}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col gap-6 p-6"
    >
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        <div className="rounded-xl bg-red-500/10 p-2.5">
          <Heart className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Favorites</h1>
          <p className="text-sm text-muted-foreground">
            {wallpapers?.length ?? 0} wallpaper{wallpapers?.length !== 1 ? "s" : ""}
          </p>
        </div>
      </motion.div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && (!wallpapers || wallpapers.length === 0) && (
        <motion.div
          variants={fadeInUp}
          className="flex flex-1 flex-col items-center justify-center gap-4"
        >
          <div className="rounded-2xl bg-muted p-6">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">No favorites yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap the heart on any wallpaper to save it here
            </p>
          </div>
        </motion.div>
      )}

      {!isLoading && wallpapers && wallpapers.length > 0 && (
        <motion.div variants={fadeInUp} className="flex-1">
          <WallpaperGrid
            wallpapers={wallpapers}
            onPreview={(wp, rect) => {
              setPreviewWallpaper(wp);
              setPreviewOrigin(rect);
            }}
            onFavorite={handleFavorite}
            onDownload={handleDownload}
            onSetWallpaper={handleSetWallpaper}
            favorites={favoriteIds}
          />
        </motion.div>
      )}

      <WallpaperPreview
        wallpaper={previewWallpaper}
        onClose={() => {
          setPreviewWallpaper(null);
          setPreviewOrigin(null);
        }}
        originRect={previewOrigin}
        isFavorited={previewWallpaper ? isFavorited(previewWallpaper.id) : false}
        onFavorite={handleFavorite}
        onDownload={handleDownload}
        onSetWallpaper={handleSetWallpaper}
      />
    </motion.div>
  );
}
