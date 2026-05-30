import { motion } from "motion/react";
import { useCreateWallpaper } from "@/hooks/useAdminWallpapers";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useAdminAppStore } from "@/stores/adminAppStore";
import { useToastStore } from "@/stores/toastStore";
import HeroHeader from "@/components/shared/HeroHeader";
import WallpaperForm from "@/components/wallpapers/WallpaperForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function WallpaperCreatePage() {
  const setCurrentView = useAdminAppStore((s) => s.setCurrentView);
  const addToast = useToastStore((s) => s.addToast);
  const createMutation = useCreateWallpaper();
  const { data: categories = [] } = useAdminCategories();

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync(data as never);
      addToast("Wallpaper created successfully", "success");
      setCurrentView("wallpapers");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to create", "error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setCurrentView("wallpapers")}><ArrowLeft className="h-5 w-5" /></Button>
        <HeroHeader title="Create Wallpaper" subtitle="Add a new wallpaper to your collection" />
      </div>
      <WallpaperForm categories={categories} onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </motion.div>
  );
}
