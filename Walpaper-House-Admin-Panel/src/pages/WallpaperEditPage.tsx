import { motion } from "motion/react";
import { useAdminWallpaper, useUpdateWallpaper, useDeleteWallpaper } from "@/hooks/useAdminWallpapers";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useAdminAppStore } from "@/stores/adminAppStore";
import { useToastStore } from "@/stores/toastStore";
import HeroHeader from "@/components/shared/HeroHeader";
import WallpaperForm from "@/components/wallpapers/WallpaperForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";

export default function WallpaperEditPage() {
  const selectedId = useAdminAppStore((s) => s.selectedWallpaperId);
  const setCurrentView = useAdminAppStore((s) => s.setCurrentView);
  const addToast = useToastStore((s) => s.addToast);
  const [showDelete, setShowDelete] = useState(false);

  const { data: wallpaper, isLoading: loadingWallpaper } = useAdminWallpaper(selectedId);
  const { data: categories = [] } = useAdminCategories();
  const updateMutation = useUpdateWallpaper();
  const deleteMutation = useDeleteWallpaper();

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!selectedId) return;
    try {
      await updateMutation.mutateAsync({ id: selectedId, ...data } as Parameters<typeof updateMutation.mutateAsync>[0]);
      addToast("Wallpaper updated", "success");
      setCurrentView("wallpapers");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to update", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteMutation.mutateAsync(selectedId);
      addToast("Wallpaper deactivated", "success");
      setCurrentView("wallpapers");
    } catch {
      addToast("Failed to delete", "error");
    }
    setShowDelete(false);
  };

  if (loadingWallpaper) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div {...{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView("wallpapers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <HeroHeader title="Edit Wallpaper" subtitle={wallpaper?.title ?? ""} />
        </div>
        <Button variant="destructive" onClick={() => setShowDelete(true)}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>
      <WallpaperForm wallpaper={wallpaper} categories={categories} onSubmit={handleSubmit} isLoading={updateMutation.isPending} />
      <ConfirmDialog open={showDelete} onOpenChange={setShowDelete} title="Deactivate Wallpaper" description="This will hide the wallpaper from the public app. You can reactivate it later." onConfirm={handleDelete} variant="destructive" />
    </motion.div>
  );
}
