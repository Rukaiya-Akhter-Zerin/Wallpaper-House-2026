import { motion } from "motion/react";
import { Plus, FolderOpen } from "lucide-react";
import { CollectionCard } from "./CollectionCard";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import type { Collection } from "@/types/database";

export function CollectionGrid({ collections, onSelect, onDelete, onCreate }: { collections: Collection[]; onSelect: (id: number) => void; onDelete?: (id: number) => void; onCreate: () => void }) {
  if (collections.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="rounded-2xl bg-muted p-6"><FolderOpen className="h-12 w-12 text-muted-foreground" /></div>
        <div className="text-center"><h3 className="text-lg font-semibold">No collections yet</h3><p className="mt-1 text-sm text-muted-foreground">Create your first collection to organize wallpapers</p></div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onCreate} className="flex items-center gap-2 rounded-xl border border-dashed border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:border-accent hover:text-accent"><Plus className="h-4 w-4" />Create Collection</motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <motion.div variants={fadeInUp} onClick={onCreate} className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-8 text-muted-foreground hover:border-accent hover:text-accent transition-colors"><Plus className="h-8 w-8" /><span className="text-sm font-medium">New Collection</span></motion.div>
      {collections.map((col) => (
        <motion.div key={col.id} variants={fadeInUp}><CollectionCard collection={col} onSelect={() => onSelect(col.id)} onDelete={onDelete ? () => onDelete(col.id) : undefined} /></motion.div>
      ))}
    </motion.div>
  );
}
