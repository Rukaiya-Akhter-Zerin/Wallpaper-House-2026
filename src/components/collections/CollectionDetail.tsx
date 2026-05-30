import { useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Edit3, Globe, Lock, Upload, Images, HardDrive } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid";
import { LocalImageCard } from "@/components/collections/LocalImageCard";
import { useLocalImagesStore } from "@/stores/localImagesStore";
import type { Wallpaper, Collection } from "@/types/database";

export function CollectionDetail({ collection, wallpapers, onBack, onPreview, onFavorite, onRemove, onUpdate, favorites, onAddFromGallery }: {
  collection: Collection; wallpapers: Wallpaper[]; onBack: () => void; onPreview: (w: Wallpaper, originRect: DOMRect) => void;
  onFavorite?: (w: Wallpaper) => void; onRemove?: (wallpaperId: number) => void;
  onUpdate?: (name: string, description: string) => void; favorites?: Set<number>;
  onAddFromGallery?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(collection.name);
  const [desc, setDesc] = useState(collection.description || "");

  const addImages = useLocalImagesStore((s) => s.addImages);
  const removeImage = useLocalImagesStore((s) => s.removeImage);
  const allLocalImages = useLocalImagesStore((s) => s.images);
  const localImages = useMemo(
    () => allLocalImages.filter((img) => img.collectionId === collection.id),
    [allLocalImages, collection.id]
  );

  const handleSave = () => { onUpdate?.(name, desc); setEditing(false); };

  const handleAddLocalImages = useCallback(async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff"] }],
        title: "Select images to add to collection",
      });
      if (!selected) return;

      const paths = Array.isArray(selected) ? selected : [selected];
      const files = paths.map((p) => ({
        name: p.split("/").pop()?.split("\\").pop() ?? "Untitled",
        localPath: p,
      }));
      addImages(files, collection.id);
    } catch (err) {
      console.error("File picker failed:", err);
    }
  }, [collection.id, addImages]);

  const handleRemoveLocal = useCallback((id: string) => {
    removeImage(id);
  }, [removeImage]);

  const totalCount = wallpapers.length + localImages.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-2"><Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 max-w-xs" /><Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className="h-8 max-w-sm" /><Button size="sm" onClick={handleSave}>Save</Button><Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button></div>
          ) : (
            <div>
              <div className="flex items-center gap-2"><h2 className="text-2xl font-semibold">{collection.name}</h2>{collection.is_public ? <Globe className="h-4 w-4 text-muted-foreground" /> : <Lock className="h-4 w-4 text-muted-foreground" />}<Button variant="ghost" size="icon" onClick={() => setEditing(true)}><Edit3 className="h-4 w-4" /></Button></div>
              {collection.description && <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>}
              <Badge variant="secondary" className="mt-2">
                {totalCount} wallpaper{totalCount !== 1 ? "s" : ""}
                {localImages.length > 0 && (
                  <span className="ml-1 text-muted-foreground">({localImages.length} local)</span>
                )}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleAddLocalImages}>
          <Upload className="mr-1.5 h-4 w-4" />Add Local Images
        </Button>
        <Button variant="outline" size="sm" onClick={onAddFromGallery}>
          <Images className="mr-1.5 h-4 w-4" />Add from Gallery
        </Button>
      </div>

      {localImages.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
          <HardDrive className="h-4 w-4 shrink-0" />
          <span>{localImages.length} local image{localImages.length !== 1 ? "s" : ""} stored on this device. Removing one only removes it from this collection, not from disk.</span>
        </div>
      )}

      <Separator />

      {localImages.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {localImages.map((img) => (
            <LocalImageCard key={img.id} image={img} onRemove={handleRemoveLocal} />
          ))}
        </div>
      )}

      <WallpaperGrid
        wallpapers={wallpapers}
        isLoading={false}
        onPreview={onPreview}
        onFavorite={onFavorite}
        onRemoveFromCollection={onRemove ? (wallpaper) => onRemove(wallpaper.id) : undefined}
        favorites={favorites}
      />

      {totalCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground"
        >
          <div className="rounded-2xl bg-muted p-5">
            <Images className="h-10 w-10" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold">No wallpapers yet</h3>
            <p className="mt-1 text-sm">Add images from the gallery or upload local files</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}