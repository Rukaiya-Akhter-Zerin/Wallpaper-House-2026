import { motion } from "motion/react";
import { slideInFromBottom, springConfigs } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { useSelectionStore } from "@/stores/selectionStore";
import { Star, Award, Eye, EyeOff, Trash2, X } from "lucide-react";

interface BulkActionBarProps {
  onBulkFeatured: () => void;
  onBulkEditorsChoice: () => void;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
}

export default function BulkActionBar({ onBulkFeatured, onBulkEditorsChoice, onBulkActivate, onBulkDeactivate, onBulkDelete }: BulkActionBarProps) {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const clearSelection = useSelectionStore((s) => s.clearSelection);

  if (selectedIds.size === 0) return null;

  return (
    <motion.div
      variants={slideInFromBottom}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={springConfigs.bouncy}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-xl px-6 py-3 flex items-center gap-4 shadow-2xl"
    >
      <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
      <div className="h-6 w-px bg-border" />
      <Button size="sm" variant="ghost" onClick={onBulkFeatured}><Star className="h-4 w-4 mr-1" /> Featured</Button>
      <Button size="sm" variant="ghost" onClick={onBulkEditorsChoice}><Award className="h-4 w-4 mr-1" /> Editors' Choice</Button>
      <Button size="sm" variant="ghost" onClick={onBulkActivate}><Eye className="h-4 w-4 mr-1" /> Activate</Button>
      <Button size="sm" variant="ghost" onClick={onBulkDeactivate}><EyeOff className="h-4 w-4 mr-1" /> Deactivate</Button>
      <Button size="sm" variant="destructive" onClick={onBulkDelete}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
      <div className="h-6 w-px bg-border" />
      <Button size="sm" variant="ghost" onClick={clearSelection}><X className="h-4 w-4" /></Button>
    </motion.div>
  );
}
