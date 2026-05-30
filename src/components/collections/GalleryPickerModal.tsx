import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, Check, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallpapers } from "@/hooks/useWallpapers";
import { cn } from "@/lib/utils";
import type { Wallpaper } from "@/types/database";

export function GalleryPickerModal({ open, onClose, onSelect, existingIds }: {
  open: boolean;
  onClose: () => void;
  onSelect: (wallpaper: Wallpaper) => void;
  existingIds?: Set<number>;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useWallpapers({
    search: search || null,
  });

  const wallpapers = data?.pages.flatMap((p) => p) ?? [];

  const toggleSelect = useCallback((wallpaper: Wallpaper) => {
    if (existingIds?.has(wallpaper.id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(wallpaper.id)) next.delete(wallpaper.id);
      else next.add(wallpaper.id);
      return next;
    });
  }, [existingIds]);

  const handleAddSelected = useCallback(() => {
    const toAdd = wallpapers.filter((w) => selected.has(w.id) && !existingIds?.has(w.id));
    toAdd.forEach((w) => onSelect(w));
    setSelected(new Set());
    onClose();
  }, [wallpapers, selected, existingIds, onSelect, onClose]);

  const handleAddSingle = useCallback((wallpaper: Wallpaper) => {
    onSelect(wallpaper);
    onClose();
  }, [onSelect, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 flex h-[80vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Add from Gallery</h2>
            {selected.size > 0 && (
              <Badge variant="default" className="gap-1">
                {selected.size} selected
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <Button size="sm" onClick={handleAddSelected}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add {selected.size} wallpaper{selected.size !== 1 ? "s" : ""}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wallpapers..."
              className="pl-9"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Click a wallpaper to add it directly, or select multiple and click "Add" above.</p>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : wallpapers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <p>No wallpapers found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {wallpapers.map((wallpaper) => {
                const alreadyAdded = existingIds?.has(wallpaper.id) ?? false;
                const isSelected = selected.has(wallpaper.id);
                return (
                  <motion.button
                    key={wallpaper.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => {
                      if (alreadyAdded) return;
                      if (e.shiftKey || e.metaKey || e.ctrlKey) {
                        toggleSelect(wallpaper);
                      } else {
                        handleAddSingle(wallpaper);
                      }
                    }}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-xl border-2 transition-colors",
                      alreadyAdded
                        ? "border-primary/50 opacity-60 cursor-not-allowed"
                        : isSelected
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-transparent hover:border-primary"
                    )}
                  >
                    <img
                      src={wallpaper.thumbnail_url_small ?? wallpaper.image_url}
                      alt={wallpaper.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="w-full truncate px-2 pb-2 text-xs font-medium text-white">
                        {wallpaper.title}
                      </p>
                    </div>
                    {alreadyAdded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                    )}
                    {isSelected && !alreadyAdded && (
                      <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {hasNextPage && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
