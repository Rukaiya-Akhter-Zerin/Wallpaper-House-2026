import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FolderPlus, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Collection } from "@/types/database";

export function AddToCollectionMenu({ collections, wallpaperId, onAdd, onCreateNew, isInCollection }: {
  collections: Collection[]; wallpaperId: number; onAdd: (collectionId: number) => void;
  onCreateNew: () => void; isInCollection: (collectionId: number) => boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30">
        <FolderPlus className="h-4 w-4" />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }} className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-card p-1 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Add to collection</div>
            {collections.map((col) => (
              <button key={col.id} onClick={() => { onAdd(col.id); setOpen(false); }} className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted", isInCollection(col.id) && "text-accent")}>
                {isInCollection(col.id) ? <Check className="h-3.5 w-3.5" /> : <FolderPlus className="h-3.5 w-3.5" />}
                <span className="truncate">{col.name}</span>
              </button>
            ))}
            <div className="my-1 h-px bg-border" />
            <button onClick={() => { onCreateNew(); setOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><Plus className="h-3.5 w-3.5" />New collection</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
