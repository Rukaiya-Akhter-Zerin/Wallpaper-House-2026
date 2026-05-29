import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Edit3, Globe, Lock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid";
import type { Wallpaper, Collection } from "@/types/database";

export function CollectionDetail({ collection, wallpapers, onBack, onPreview, onFavorite, onRemove, onUpdate, favorites }: {
  collection: Collection; wallpapers: Wallpaper[]; onBack: () => void; onPreview: (w: Wallpaper) => void;
  onFavorite?: (w: Wallpaper) => void; onRemove?: (wallpaperId: number) => void;
  onUpdate?: (name: string, description: string) => void; favorites?: Set<number>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(collection.name);
  const [desc, setDesc] = useState(collection.description || "");

  const handleSave = () => { onUpdate?.(name, desc); setEditing(false); };

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
              <Badge variant="secondary" className="mt-2">{wallpapers.length} wallpapers</Badge>
            </div>
          )}
        </div>
      </div>
      <Separator />
      <WallpaperGrid wallpapers={wallpapers} isLoading={false} onPreview={onPreview} onFavorite={onFavorite} favorites={favorites} />
    </div>
  );
}
