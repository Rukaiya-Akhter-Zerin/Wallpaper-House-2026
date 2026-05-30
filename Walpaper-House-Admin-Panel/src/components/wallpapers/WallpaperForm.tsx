import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import ImageUploader from "@/components/shared/ImageUploader";
import TagInput from "@/components/shared/TagInput";
import type { Wallpaper, Category } from "@/types/database";

interface WallpaperFormProps {
  wallpaper?: Wallpaper | null;
  categories: Category[];
  onSubmit: (data: Partial<Wallpaper>) => void;
  isLoading?: boolean;
}

export default function WallpaperForm({ wallpaper, categories, onSubmit, isLoading }: WallpaperFormProps) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [thumbnailSmall, setThumbnailSmall] = useState("");
  const [thumbnailMedium, setThumbnailMedium] = useState("");
  const [thumbnailLarge, setThumbnailLarge] = useState("");
  const [resolution, setResolution] = useState("4K");
  const [width, setWidth] = useState(3840);
  const [height, setHeight] = useState(2160);
  const [orientation, setOrientation] = useState<"portrait" | "landscape" | "square">("landscape");
  const [author, setAuthor] = useState("");
  const [source, setSource] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [license, setLicense] = useState("free");
  const [dominantColor, setDominantColor] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isEditorsChoice, setIsEditorsChoice] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (wallpaper) {
      setTitle(wallpaper.title); setCategoryId(wallpaper.category_id); setTags(wallpaper.tags ?? []);
      setImageUrl(wallpaper.image_url); setThumbnailSmall(wallpaper.thumbnail_url_small ?? "");
      setThumbnailMedium(wallpaper.thumbnail_url_medium ?? ""); setThumbnailLarge(wallpaper.thumbnail_url_large ?? "");
      setResolution(wallpaper.resolution); setWidth(wallpaper.width); setHeight(wallpaper.height);
      setOrientation(wallpaper.orientation); setAuthor(wallpaper.author ?? ""); setSource(wallpaper.source ?? "");
      setSourceUrl(wallpaper.source_url ?? ""); setLicense(wallpaper.license ?? "free");
      setDominantColor(wallpaper.dominant_color ?? ""); setIsFeatured(wallpaper.is_featured);
      setIsEditorsChoice(wallpaper.is_editors_choice); setIsActive(wallpaper.is_active);
    }
  }, [wallpaper]);

  useEffect(() => {
    if (width > height) setOrientation("landscape");
    else if (height > width) setOrientation("portrait");
    else setOrientation("square");
  }, [width, height]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title, category_id: categoryId, tags, image_url: imageUrl,
      thumbnail_url_small: thumbnailSmall || null, thumbnail_url_medium: thumbnailMedium || null,
      thumbnail_url_large: thumbnailLarge || null, resolution, width, height, orientation,
      author: author || null, source: source || null, source_url: sourceUrl || null,
      license: license || null, dominant_color: dominantColor || null,
      is_featured: isFeatured, is_editors_choice: isEditorsChoice, is_active: isActive,
    });
  };

  const categoryOptions = categories.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 neomorphic p-6">
          <h3 className="text-lg font-semibold text-foreground">Basic Info</h3>
          <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mountain Sunrise" required /></div>
          <div className="space-y-2"><Label>Category</Label><Select options={categoryOptions} value={categoryId ? String(categoryId) : ""} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)} placeholder="Select category" /></div>
          <div className="space-y-2"><Label>Tags</Label><TagInput value={tags} onChange={setTags} /></div>
          <div className="space-y-2"><Label>Image</Label><ImageUploader value={imageUrl} onChange={setImageUrl} /></div>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2"><Label>Thumbnail URL (Small)</Label><Input value={thumbnailSmall} onChange={(e) => setThumbnailSmall(e.target.value)} placeholder="Auto-generated or manual" /></div>
            <div className="space-y-2"><Label>Thumbnail URL (Medium)</Label><Input value={thumbnailMedium} onChange={(e) => setThumbnailMedium(e.target.value)} placeholder="Auto-generated or manual" /></div>
            <div className="space-y-2"><Label>Thumbnail URL (Large)</Label><Input value={thumbnailLarge} onChange={(e) => setThumbnailLarge(e.target.value)} placeholder="Auto-generated or manual" /></div>
          </div>
        </div>
        <div className="space-y-4 neomorphic p-6">
          <h3 className="text-lg font-semibold text-foreground">Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Resolution</Label><Select options={[{ value: "4K", label: "4K" }, { value: "2K", label: "2K" }, { value: "1080p", label: "1080p" }, { value: "Ultrawide", label: "Ultrawide" }]} value={resolution} onChange={(e) => setResolution(e.target.value)} /></div>
            <div className="space-y-2"><Label>Orientation</Label><Select options={[{ value: "landscape", label: "Landscape" }, { value: "portrait", label: "Portrait" }, { value: "square", label: "Square" }]} value={orientation} onChange={(e) => setOrientation(e.target.value as "portrait" | "landscape" | "square")} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Width (px)</Label><Input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} /></div>
            <div className="space-y-2"><Label>Height (px)</Label><Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Author</Label><Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Photographer name" /></div>
            <div className="space-y-2"><Label>Source</Label><Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="unsplash" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Source URL</Label><Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." /></div>
            <div className="space-y-2"><Label>License</Label><Select options={[{ value: "free", label: "Free" }, { value: "premium", label: "Premium" }, { value: "editorial", label: "Editorial" }]} value={license} onChange={(e) => setLicense(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Dominant Color</Label><div className="flex gap-2"><Input value={dominantColor} onChange={(e) => setDominantColor(e.target.value)} placeholder="#a855f7" />{dominantColor && <div className="h-9 w-9 rounded-md border border-border" style={{ backgroundColor: dominantColor }} />}</div></div>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between"><Label>Featured</Label><Switch checked={isFeatured} onCheckedChange={setIsFeatured} /></div>
            <div className="flex items-center justify-between"><Label>Editors' Choice</Label><Switch checked={isEditorsChoice} onCheckedChange={setIsEditorsChoice} /></div>
            <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={isActive} onCheckedChange={setIsActive} /></div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading || !imageUrl || !title}>{isLoading ? "Saving..." : wallpaper ? "Update Wallpaper" : "Create Wallpaper"}</Button>
      </div>
    </form>
  );
}
