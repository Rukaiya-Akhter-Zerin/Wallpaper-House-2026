import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabase-admin";

export interface AdminStats {
  totalWallpapers: number;
  activeWallpapers: number;
  featuredCount: number;
  editorsChoiceCount: number;
  popularCount: number;
  categoriesCount: number;
  totalDownloads: number;
  recentUploads: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<AdminStats> => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        { count: total },
        { count: active },
        { count: featured },
        { count: editorsChoice },
        { count: popular },
        { count: categories },
        { data: downloadsData },
        { count: recent },
      ] = await Promise.all([
        supabaseAdmin.from("wallpapers").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("wallpapers").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabaseAdmin.from("wallpapers").select("*", { count: "exact", head: true }).eq("is_featured", true),
        supabaseAdmin.from("wallpapers").select("*", { count: "exact", head: true }).eq("is_editors_choice", true),
        supabaseAdmin.from("wallpapers").select("*", { count: "exact", head: true }).gte("downloads_count", 1000),
        supabaseAdmin.from("categories").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("wallpapers").select("downloads_count"),
        supabaseAdmin.from("wallpapers").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
      ]);

      const totalDownloads = (downloadsData ?? []).reduce((sum, w) => sum + (w.downloads_count ?? 0), 0);

      return {
        totalWallpapers: total ?? 0,
        activeWallpapers: active ?? 0,
        featuredCount: featured ?? 0,
        editorsChoiceCount: editorsChoice ?? 0,
        popularCount: popular ?? 0,
        categoriesCount: categories ?? 0,
        totalDownloads,
        recentUploads: recent ?? 0,
      };
    },
  });
}
