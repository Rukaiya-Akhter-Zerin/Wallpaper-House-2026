import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Category, Wallpaper } from "@/types/database";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useWallpapersByCategory(slug: string | null) {
  return useQuery<Wallpaper[]>({
    queryKey: ["wallpapers-by-category", slug],
    queryFn: async () => {
      if (!slug) return [];

      const { data: cat, error: catErr } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .single();

      if (catErr || !cat) return [];

      const { data, error } = await supabase
        .from("wallpapers")
        .select("*")
        .eq("category_id", cat.id)
        .eq("is_active", true)
        .order("downloads_count", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
