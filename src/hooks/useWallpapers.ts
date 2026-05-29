import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Wallpaper, Category } from "@/types/database";

const PAGE_SIZE = 20;

export interface WallpaperFilters {
  category_id?: number | null;
  resolution?: string | null;
  orientation?: string | null;
  sort?: "created_at" | "downloads_count" | "likes_count";
  search?: string | null;
}

export function useWallpapers(filters: WallpaperFilters = {}) {
  return useInfiniteQuery({
    queryKey: ["wallpapers", filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("wallpapers")
        .select("*")
        .eq("is_active", true)
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      if (filters.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters.resolution) {
        query = query.eq("resolution", filters.resolution);
      }
      if (filters.orientation) {
        query = query.eq("orientation", filters.orientation as "portrait" | "landscape" | "square");
      }
      if (filters.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      const sortCol = filters.sort ?? "created_at";
      query = query.order(sortCol, { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data as Wallpaper[];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    initialPageParam: 0,
  });
}

export function useWallpaper(id: number | null) {
  return useQuery({
    queryKey: ["wallpaper", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("wallpapers")
        .select("*, categories(name, slug, icon, color)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Wallpaper & { categories: Category | null };
    },
    enabled: !!id,
  });
}

export function useFeaturedWallpapers() {
  return useQuery({
    queryKey: ["wallpapers", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallpapers")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data as Wallpaper[];
    },
  });
}

export function usePopularWallpapers() {
  return useQuery({
    queryKey: ["wallpapers", "popular"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallpapers")
        .select("*")
        .eq("is_active", true)
        .order("downloads_count", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as Wallpaper[];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });
}
