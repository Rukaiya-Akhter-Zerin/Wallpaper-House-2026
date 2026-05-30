import { useEffect } from "react";
import { useCollectionsStore } from "@/stores/collectionsStore";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Wallpaper } from "@/types/database";

export function useCollections() {
  const store = useCollectionsStore();

  useEffect(() => {
    store.loadCollections();
  }, []);

  return {
    collections: store.collections,
    isLoading: store.isLoading,
    selectCollection: store.selectCollection,
    selectedCollectionId: store.selectedCollectionId,
  };
}

export function useCollection(id: number | null) {
  return useQuery({
    queryKey: ["collection", id],
    queryFn: async () => {
      if (!id) return null;

      const { data: col } = await supabase
        .from("collections")
        .select("*")
        .eq("id", id)
        .single();

      if (!col) return null;

      const { data: items } = await supabase
        .from("collection_items")
        .select("*, wallpaper:wallpapers(*)")
        .eq("collection_id", id)
        .order("order_index");

      return {
        ...col,
        items: items || [],
      };
    },
    enabled: !!id,
    staleTime: 10_000,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  const store = useCollectionsStore();

  return {
    mutate: async (params: { name: string; description?: string; is_public?: boolean }) => {
      await store.createCollection(params.name, params.description, params.is_public);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    isLoading: false,
  };
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();
  const store = useCollectionsStore();

  return {
    mutate: async (params: {
      id: number;
      name?: string;
      description?: string;
      is_public?: boolean;
    }) => {
      const updates: Record<string, unknown> = {};
      if (params.name !== undefined) updates.name = params.name;
      if (params.description !== undefined) updates.description = params.description;
      if (params.is_public !== undefined) updates.is_public = params.is_public;
      await store.updateCollection(params.id, updates);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  };
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  const store = useCollectionsStore();

  return {
    mutate: async (id: number) => {
      await store.deleteCollection(id);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  };
}

export function useAddToCollection() {
  const queryClient = useQueryClient();
  const store = useCollectionsStore();

  return {
    mutate: async (params: { collectionId: number; wallpaperId: number }) => {
      await store.addToCollection(params.collectionId, params.wallpaperId);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collection", params.collectionId] });
      queryClient.invalidateQueries({ queryKey: ["collection-wallpapers", params.collectionId] });
    },
  };
}

export function useRemoveFromCollection() {
  const queryClient = useQueryClient();
  const store = useCollectionsStore();

  return {
    mutate: async (params: { collectionId: number; wallpaperId: number }) => {
      await store.removeFromCollection(params.collectionId, params.wallpaperId);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collection", params.collectionId] });
      queryClient.invalidateQueries({ queryKey: ["collection-wallpapers", params.collectionId] });
    },
  };
}

export function useCollectionWallpapers(collectionId: number | null) {
  return useQuery({
    queryKey: ["collection-wallpapers", collectionId],
    queryFn: async (): Promise<Wallpaper[]> => {
      if (!collectionId) return [];

      const { data: items } = await supabase
        .from("collection_items")
        .select("wallpaper_id, order_index")
        .eq("collection_id", collectionId)
        .order("order_index");

      if (!items || items.length === 0) return [];

      const ids = items.map((i) => i.wallpaper_id);
      const { data: wallpapers } = await supabase
        .from("wallpapers")
        .select("*")
        .in("id", ids);

      if (!wallpapers) return [];

      const wallpaperMap = new Map(wallpapers.map((w) => [w.id, w]));
      return items
        .map((item) => wallpaperMap.get(item.wallpaper_id))
        .filter(Boolean) as Wallpaper[];
    },
    enabled: !!collectionId,
    staleTime: 10_000,
  });
}
