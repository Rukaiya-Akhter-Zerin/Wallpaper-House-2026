import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Collection, CollectionItem, Wallpaper } from "@/types/database";

interface CollectionWithItems extends Collection {
  items: (CollectionItem & { wallpaper?: Wallpaper })[];
}

interface CollectionsState {
  collections: CollectionWithItems[];
  selectedCollectionId: number | null;
  isLoading: boolean;

  loadCollections: () => Promise<void>;
  selectCollection: (id: number | null) => void;
  createCollection: (name: string, description?: string, isPublic?: boolean) => Promise<void>;
  updateCollection: (id: number, updates: Partial<Pick<Collection, "name" | "description" | "is_public">>) => Promise<void>;
  deleteCollection: (id: number) => Promise<void>;
  addToCollection: (collectionId: number, wallpaperId: number) => Promise<void>;
  removeFromCollection: (collectionId: number, wallpaperId: number) => Promise<void>;
  reorderItems: (collectionId: number, items: { wallpaper_id: number; order_index: number }[]) => Promise<void>;
}

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: [],
  selectedCollectionId: null,
  isLoading: false,

  loadCollections: async () => {
    set({ isLoading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        set({ collections: [], isLoading: false });
        return;
      }

      const { data: cols } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", session.session.user.id)
        .order("updated_at", { ascending: false });

      if (!cols) {
        set({ collections: [], isLoading: false });
        return;
      }

      const collectionsWithItems: CollectionWithItems[] = await Promise.all(
        cols.map(async (col) => {
          const { data: items } = await supabase
            .from("collection_items")
            .select("*, wallpaper:wallpapers(*)")
            .eq("collection_id", col.id)
            .order("order_index");

          return {
            ...col,
            items: (items || []) as (CollectionItem & { wallpaper?: Wallpaper })[],
          };
        })
      );

      set({ collections: collectionsWithItems, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  selectCollection: (id) => set({ selectedCollectionId: id }),

  createCollection: async (name, description, isPublic = false) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from("collections")
        .insert({
          user_id: session.session.user.id,
          name,
          description: description || null,
          is_public: isPublic,
        } as any)
        .select()
        .single();

      if (error || !data) return;

      set((s) => ({
        collections: [{ ...data, items: [] }, ...s.collections],
      }));
    } catch {}
  },

  updateCollection: async (id, updates) => {
    try {
      await supabase.from("collections").update(updates as any).eq("id", id);
      set((s) => ({
        collections: s.collections.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      }));
    } catch {}
  },

  deleteCollection: async (id) => {
    try {
      await supabase.from("collections").delete().eq("id", id);
      set((s) => ({
        collections: s.collections.filter((c) => c.id !== id),
        selectedCollectionId:
          s.selectedCollectionId === id ? null : s.selectedCollectionId,
      }));
    } catch {}
  },

  addToCollection: async (collectionId, wallpaperId) => {
    try {
      const col = get().collections.find((c) => c.id === collectionId);
      const nextIndex = col ? col.items.length : 0;

      const { data: item } = await supabase
        .from("collection_items")
        .insert({
          collection_id: collectionId,
          wallpaper_id: wallpaperId,
          order_index: nextIndex,
        } as any)
        .select("*, wallpaper:wallpapers(*)")
        .single();

      if (!item) return;

      set((s) => ({
        collections: s.collections.map((c) =>
          c.id === collectionId
            ? {
                ...c,
                items: [...c.items, item as CollectionItem & { wallpaper?: Wallpaper }],
                wallpaper_count: c.wallpaper_count + 1,
              }
            : c
        ),
      }));
    } catch {}
  },

  removeFromCollection: async (collectionId, wallpaperId) => {
    try {
      await supabase
        .from("collection_items")
        .delete()
        .eq("collection_id", collectionId)
        .eq("wallpaper_id", wallpaperId);

      set((s) => ({
        collections: s.collections.map((c) =>
          c.id === collectionId
            ? {
                ...c,
                items: c.items.filter((i) => i.wallpaper_id !== wallpaperId),
                wallpaper_count: Math.max(0, c.wallpaper_count - 1),
              }
            : c
        ),
      }));
    } catch {}
  },

  reorderItems: async (collectionId, items) => {
    try {
      const updates = items.map((item) =>
        supabase
          .from("collection_items")
          .update({ order_index: item.order_index })
          .eq("collection_id", collectionId)
          .eq("wallpaper_id", item.wallpaper_id)
      );
      await Promise.all(updates);

      set((s) => ({
        collections: s.collections.map((c) => {
          if (c.id !== collectionId) return c;
          const orderMap = new Map(items.map((i) => [i.wallpaper_id, i.order_index]));
          const reordered = [...c.items].sort(
            (a, b) => (orderMap.get(a.wallpaper_id) ?? 0) - (orderMap.get(b.wallpaper_id) ?? 0)
          );
          return { ...c, items: reordered };
        }),
      }));
    } catch {}
  },
}));
