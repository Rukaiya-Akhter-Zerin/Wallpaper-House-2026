import { useState, useCallback, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Edit3, Globe, Lock, Upload, Images, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid";
import { useLocalImagesStore, type LocalImage } from "@/stores/localImagesStore";
import type { Wallpaper, Collection } from "@/types/database";

export function CollectionDetail({ collection, wallpapers, onBack, onPreview, onFavorite, onRemove, onUpdate, favorites, onAddFromGallery }: {
  collection: Collection; wallpapers: Wallpaper[]; onBack: () => void; onPreview: (w: Wallpaper) => void;
  onFavorite?: (w: Wallpaper) => void; onRemove?: (wallpaperId: number) => void;
  onUpdate?: (name: string, description: string) => void; favorites?: Set<number>;
  onAddFromGallery?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(collection.name);
  const [desc, setDesc] = useState(collection.description || "");
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addLocalImage, getCollectionImages } = useLocalImagesStore();
  const localImages = useMemo(() => getCollectionImages(collection.id), [collection.id, getCollectionImages]);

  const handleSave = () => { onUpdate?.(name, desc); setEditing(false); };

  const handleLocalUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      addLocalImage(collection.id, {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        image_url: blobUrl,
        thumbnail_url_medium: blobUrl,
        width: img.width,
        height: img.height,
        resolution: `${img.width}x${img.height}`,
        is_local: true,
        original_path: file.name,
        collection_id: collection.id,
        added_at: new Date().toISOString(),
      });
    };
    img.src = blobUrl;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [collection.id, addLocalImage]);

  const handleImageError = useCallback((imageId: string) => {
    setFailedImages((prev) => new Set(prev).add(imageId));
  }, []);

  const allWallpapers = useMemo(() => {
    const localAsWallpapers = localImages.map((img) => ({
      id: parseInt(img.id.replace(/\D/g, "").slice(0, 8), 10) || Math.floor(Math.random() * 1000000),
      title: img.title,
      image_url: failedImages.has(img.id) ? "" : img.image_url,
      thumbnail_url_medium: failedImages.has(img.id) ? "" : img.thumbnail_url_medium,
      thumbnail_url_small: "",
      width: img.width,
      height: img.height,
      resolution: img.resolution,
      orientation: "landscape" as const,
      category_id: null,
      author: null,
      tags: [],
      downloads_count: 0,
      likes_count: 0,
      is_active: true,
      is_featured: false,
      created_at: img.added_at,
      _localId: img.id,
      is_local: true,
    }));
    return [...localAsWallpapers, ...wallpapers];
  }, [localImages, wallpapers, failedImages]);

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
              <Badge variant="secondary" className="mt-2">{wallpapers.length + localImages.length} wallpapers{localImages.length > 0 && <span className="ml-1 text-muted-foreground">({localImages.length} local)</span>}</Badge>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLocalUpload} />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-1.5 h-4 w-4" />Upload Local Image
        </Button>
        <Button variant="outline" size="sm" onClick={onAddFromGallery}>
          <Images className="mr-1.5 h-4 w-4" />Add from Gallery
        </Button>
      </div>
      {localImages.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/50 p-3 flex items-center gap-2 text-sm text-muted-foreground">
          <HardDrive className="h-4 w-4" />
          <span>{localImages.length} local image{localImages.length !== 1 ? "s" : ""} on this device. Stored in browser memory — show as "not found" after restart.</span>
        </div>
      )}
      <Separator />
      <WallpaperGrid wallpapers={allWallpapers as Wallpaper[]} isLoading={false} onPreview={onPreview} onFavorite={onFavorite} favorites={favorites} />
    </div>
  );
}
