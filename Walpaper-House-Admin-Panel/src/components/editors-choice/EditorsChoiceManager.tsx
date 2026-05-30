import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { useUpdateWallpaper } from "@/hooks/useAdminWallpapers";
import { useToastStore } from "@/stores/toastStore";
import WallpaperThumbnail from "@/components/shared/WallpaperThumbnail";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Award, X } from "lucide-react";
import { motion } from "motion/react";
import { staggerContainer, fadeInUp, springConfigs } from "@/lib/motion";
import type { Wallpaper } from "@/types/database";

export default function EditorsChoiceManager() {
  const [search, setSearch] = useState("");
  const updateMutation = useUpdateWallpaper();
  const addToast = useToastStore((s) => s.addToast);

  const { data: editorsChoice = [] } = useQuery({
    queryKey: ["admin-editors-choice"],
    queryFn: async () => {
      const { data } = await supabaseAdmin.from("wallpapers").select("*").eq("is_editors_choice", true).order("created_at", { ascending: false });
      return (data ?? []) as Wallpaper[];
    },
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ["admin-ec-search", search],
    queryFn: async () => {
      if (!search.trim()) return [];
      const { data } = await supabaseAdmin.from("wallpapers").select("*").eq("is_active", true).ilike("title", `%${search}%`).limit(20);
      return (data ?? []) as Wallpaper[];
    },
    enabled: search.trim().length > 0,
  });

  const toggleEC = async (wp: Wallpaper, value: boolean) => {
    try {
      await updateMutation.mutateAsync({ id: wp.id, is_editors_choice: value });
      addToast(value ? `Added "${wp.title}" to editors' choice` : `Removed "${wp.title}"`, "success");
    } catch { addToast("Failed to update", "error"); }
  };

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center gap-2 mb-4"><Award className="h-5 w-5 text-rose-400" /><h3 className="text-lg font-semibold">Editors' Choice ({editorsChoice.length})</h3></div>
        <motion.div variants={staggerContainer(0.05)} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {editorsChoice.map((wp) => (
            <motion.div key={wp.id} variants={fadeInUp} transition={springConfigs.bouncy} className="relative group">
              <WallpaperThumbnail src={wp.thumbnail_url_small ?? wp.image_url} alt={wp.title} className="aspect-[3/4]" />
              <button onClick={() => toggleEC(wp, false)} className="absolute top-2 right-2 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"><X className="h-3.5 w-3.5" /></button>
              <p className="mt-1 text-xs text-muted-foreground truncate">{wp.title}</p>
            </motion.div>
          ))}
          {editorsChoice.length === 0 && <p className="text-muted-foreground text-sm col-span-full">No editors' choice wallpapers</p>}
        </motion.div>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-4">Add to Editors' Choice</h3>
        <div className="relative mb-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search wallpapers..." className="pl-10" /></div>
        <motion.div variants={staggerContainer(0.05)} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {searchResults.map((wp) => (
            <motion.div key={wp.id} variants={fadeInUp} transition={springConfigs.bouncy} className="relative group">
              <WallpaperThumbnail src={wp.thumbnail_url_small ?? wp.image_url} alt={wp.title} className="aspect-[3/4]" />
              <Button size="sm" variant={wp.is_editors_choice ? "default" : "outline"} className="mt-1 w-full text-xs" onClick={() => toggleEC(wp, !wp.is_editors_choice)}>
                {wp.is_editors_choice ? <><Award className="h-3 w-3 mr-1 fill-current" /> Chosen</> : <><Award className="h-3 w-3 mr-1" /> Choose</>}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
