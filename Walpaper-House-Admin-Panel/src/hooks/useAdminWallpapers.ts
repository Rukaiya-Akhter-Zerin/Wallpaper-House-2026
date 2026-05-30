import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Wallpaper } from "@/types/database";

export interface WallpaperFilters {
  search?: string;
  category_id?: number | null;
  status?: "all" | "active" | "inactive";
  featured?: "all" | "featured" | "not_featured";
  editors_choice?: "all" | "editors_choice" | "not_editors_choice";
  orientation?: string;
  resolution?: string;
  sort?: "newest" | "downloads" | "likes" | "title";
  page?: number;
  perPage?: number;
}

export function useAdminWallpapers(filters: WallpaperFilters = {}) {
  const { search, category_id, status, featured, editors_choice, orientation, resolution, sort = "newest", page = 1, perPage = 20 } = filters;

  return useQuery({
    queryKey: ["admin-wallpapers", filters],
    queryFn: async () => {
      let query = supabaseAdmin.from("wallpapers").select("*, categories(name, slug)", { count: "exact" });

      if (search) query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
      if (category_id) query = query.eq("category_id", category_id);
      if (status === "active") query = query.eq("is_active", true);
      if (status === "inactive") query = query.eq("is_active", false);
      if (featured === "featured") query = query.eq("is_featured", true);
      if (featured === "not_featured") query = query.eq("is_featured", false);
      if (editors_choice === "editors_choice") query = query.eq("is_editors_choice", true);
      if (editors_choice === "not_editors_choice") query = query.eq("is_editors_choice", false);
      if (orientation) query = query.eq("orientation", orientation as "portrait" | "landscape" | "square");
      if (resolution) query = query.eq("resolution", resolution);

      const orderMap = {
        newest: { column: "created_at", ascending: false },
        downloads: { column: "downloads_count", ascending: false },
        likes: { column: "likes_count", ascending: false },
        title: { column: "title", ascending: true },
      } as const;
      const ord = orderMap[sort];
      query = query.order(ord.column, { ascending: ord.ascending });

      const from = (page - 1) * perPage;
      query = query.range(from, from + perPage - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { wallpapers: (data ?? []) as Wallpaper[], total: count ?? 0, page, perPage };
    },
  });
}

export function useAdminWallpaper(id: number | null) {
  return useQuery({
    queryKey: ["admin-wallpaper", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabaseAdmin.from("wallpapers").select("*, categories(name, slug)").eq("id", id).single();
      if (error) throw error;
      return data as Wallpaper;
    },
    enabled: !!id,
  });
}

export function useCreateWallpaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (wallpaper: Partial<Wallpaper> & { title: string; image_url: string }) => {
      const { data, error } = await supabaseAdmin.from("wallpapers").insert(wallpaper as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-wallpapers"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); },
  });
}

export function useUpdateWallpaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Wallpaper> & { id: number }) => {
      const { data, error } = await supabaseAdmin.from("wallpapers").update(updates as never).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin-wallpapers"] });
      qc.invalidateQueries({ queryKey: ["admin-wallpaper", variables.id] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-featured"] });
      qc.invalidateQueries({ queryKey: ["admin-editors-choice"] });
      qc.invalidateQueries({ queryKey: ["admin-popular"] });
    },
  });
}

export function useDeleteWallpaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabaseAdmin.from("wallpapers").update({ is_active: false } as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-wallpapers"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); },
  });
}
