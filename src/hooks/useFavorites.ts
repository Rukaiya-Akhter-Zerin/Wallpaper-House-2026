import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { supabase } from "@/lib/supabase";
import type { Wallpaper } from "@/types/database";

export function useFavorites() {
  const store = useFavoritesStore();

  useEffect(() => {
    store.loadFavorites();
  }, []);

  return store;
}

export function useToggleFavorite() {
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorited = useFavoritesStore((s) => s.isFavorited);
  const queryClient = useQueryClient();

  return {
    toggle: async (wallpaperId: number) => {
      await toggleFavorite(wallpaperId);
      queryClient.invalidateQueries({ queryKey: ["favorite-wallpapers"] });
    },
    isFavorited,
  };
}

export function useFavoriteWallpapers() {
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);

  return useQuery({
    queryKey: ["favorite-wallpapers", [...favoriteIds].sort().join(",")],
    queryFn: async (): Promise<Wallpaper[]> => {
      const ids = [...favoriteIds];
      if (ids.length === 0) return [];

      const { data, error } = await supabase
        .from("wallpapers")
        .select("*")
        .in("id", ids)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Wallpaper[];
    },
    enabled: favoriteIds.size > 0,
    staleTime: 30_000,
  });
}
