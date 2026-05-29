import { motion } from "motion/react";
import { Folder, Trash2, Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cardHover } from "@/lib/motion";
import type { Collection } from "@/types/database";

export function CollectionCard({ collection, onSelect, onDelete }: { collection: Collection & { items?: unknown[] }; onSelect: () => void; onDelete?: () => void }) {
  const coverUrl = collection.cover_url;
  return (
    <motion.div {...cardHover} onClick={onSelect} className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {coverUrl ? <img src={coverUrl} alt={collection.name} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full w-full items-center justify-center"><Folder className="h-12 w-12 text-muted-foreground/40" /></div>}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="truncate text-sm font-medium">{collection.name}</h3>
          {collection.is_public ? <Globe className="h-3 w-3 text-muted-foreground" /> : <Lock className="h-3 w-3 text-muted-foreground" />}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{collection.wallpaper_count} wallpapers</Badge>
        </div>
      </div>
      {onDelete && (
        <motion.button initial={{ opacity: 0 }} whileHover={{ scale: 1.1 }} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 className="h-4 w-4" />
        </motion.button>
      )}
    </motion.div>
  );
}
