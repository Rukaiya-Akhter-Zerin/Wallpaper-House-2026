import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { FolderOpen, Plus } from "lucide-react";
import { useCollections, useCreateCollection, useDeleteCollection, useCollectionWallpapers } from "@/hooks/useCollections";
import { CollectionGrid } from "@/components/collections/CollectionGrid";
import { CollectionDetail } from "@/components/collections/CollectionDetail";
import { CreateCollectionDialog } from "@/components/collections/CreateCollectionDialog";
import { Button } from "@/components/ui/button";
import { useCollectionsStore } from "@/stores/collectionsStore";
import type { Wallpaper } from "@/types/database";

export function Collections() {
  const { collections, selectedCollectionId, selectCollection } = useCollections();
  const [showCreate, setShowCreate] = useState(false);
  const createCol = useCreateCollection();
  const deleteCol = useDeleteCollection();
  const selectedCollection = collections.find((c) => c.id === selectedCollectionId) || null;
  const { data: collectionWallpapers = [] } = useCollectionWallpapers(selectedCollectionId);

  const handleCreate = async (name: string, description: string, isPublic: boolean) => {
    await createCol.mutate({ name, description, is_public: isPublic });
  };

  return (
    <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible" className="flex h-full flex-col gap-6 p-6">
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-500/10 p-2.5"><FolderOpen className="h-6 w-6 text-violet-500" /></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{selectedCollectionId !== null ? "Collection" : "Your Collections"}</h1>
            <p className="text-sm text-muted-foreground">Organize wallpapers into custom playlists</p>
          </div>
        </div>
        {selectedCollectionId === null && (
          <Button onClick={() => setShowCreate(true)} size="sm"><Plus className="mr-1.5 h-4 w-4" />New Collection</Button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {selectedCollection && selectedCollectionId !== null ? (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex-1">
            <CollectionDetail
              collection={selectedCollection}
              wallpapers={collectionWallpapers}
              onBack={() => selectCollection(null)}
              onPreview={() => {}}
            />
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="flex-1">
            <CollectionGrid collections={collections} onSelect={(id) => selectCollection(id)} onDelete={(id) => deleteCol.mutate(id)} onCreate={() => setShowCreate(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      <CreateCollectionDialog open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
    </motion.div>
  );
}
