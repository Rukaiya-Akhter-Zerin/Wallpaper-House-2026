import { useState } from "react";
import { motion } from "motion/react";
import { useAdminWallpapers, type WallpaperFilters } from "@/hooks/useAdminWallpapers";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useDeleteWallpaper, useUpdateWallpaper } from "@/hooks/useAdminWallpapers";
import { useSelectionStore } from "@/stores/selectionStore";
import { useAdminAppStore } from "@/stores/adminAppStore";
import { useToastStore } from "@/stores/toastStore";
import HeroHeader from "@/components/shared/HeroHeader";
import WallpaperFiltersComponent from "@/components/wallpapers/WallpaperFilters";
import WallpaperTable from "@/components/wallpapers/WallpaperTable";
import BulkActionBar from "@/components/shared/BulkActionBar";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function WallpapersPage() {
  const [filters, setFilters] = useState<WallpaperFilters>({ sort: "newest", page: 1, perPage: 20 });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const setCurrentView = useAdminAppStore((s) => s.setCurrentView);
  const setSelectedWallpaperId = useAdminAppStore((s) => s.setSelectedWallpaperId);
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const clearSelection = useSelectionStore((s) => s.clearSelection);
  const addToast = useToastStore((s) => s.addToast);

  const { data, isLoading } = useAdminWallpapers(filters);
  const { data: categories = [] } = useAdminCategories();
  const deleteMutation = useDeleteWallpaper();
  const updateMutation = useUpdateWallpaper();

  const wallpapers = data?.wallpapers ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / (filters.perPage ?? 20));
  const allIds = wallpapers.map((w) => w.id);

  const handleEdit = (id: number) => { setSelectedWallpaperId(id); setCurrentView("wallpaper-edit"); };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteMutation.mutateAsync(deleteId); addToast("Wallpaper deactivated", "success"); }
    catch { addToast("Failed to delete", "error"); }
    setDeleteId(null);
  };

  const bulkToggle = async (field: "is_featured" | "is_editors_choice" | "is_active", value: boolean) => {
    const ids = Array.from(selectedIds);
    try { await Promise.all(ids.map((id) => updateMutation.mutateAsync({ id, [field]: value }))); addToast(`${ids.length} wallpapers updated`, "success"); }
    catch { addToast("Some updates failed", "error"); }
    clearSelection();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="flex items-center justify-between mb-6">
        <HeroHeader title="Wallpapers" subtitle={`${total} wallpapers total`} />
        <Button onClick={() => setCurrentView("wallpaper-create")}><Plus className="h-4 w-4 mr-1" /> Create New</Button>
      </div>
      <div className="neomorphic p-4 mb-4"><WallpaperFiltersComponent filters={filters} onFiltersChange={setFilters} categories={categories} /></div>
      <div className="neomorphic p-4"><WallpaperTable wallpapers={wallpapers} isLoading={isLoading} onEdit={handleEdit} onDelete={setDeleteId} allIds={allIds} /></div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">Showing {(filters.page! - 1) * filters.perPage! + 1}-{Math.min(filters.page! * filters.perPage!, total)} of {total}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="flex items-center px-3 text-sm">{filters.page} / {totalPages}</span>
            <Button size="sm" variant="outline" disabled={filters.page === totalPages} onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
      <BulkActionBar onBulkFeatured={() => bulkToggle("is_featured", true)} onBulkEditorsChoice={() => bulkToggle("is_editors_choice", true)} onBulkActivate={() => bulkToggle("is_active", true)} onBulkDeactivate={() => bulkToggle("is_active", false)} onBulkDelete={() => {}} />
      <ConfirmDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)} title="Deactivate Wallpaper" description="This will hide the wallpaper from the public app." onConfirm={handleDelete} variant="destructive" />
    </motion.div>
  );
}
