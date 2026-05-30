import { create } from "zustand";
import { supabase } from "@/lib/supabase";

const LS_KEY = "wh-favorites";

function loadFromLocalStorage(): Set<number> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveToLocalStorage(ids: Set<number>) {
  localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
}

interface FavoritesState {
  favoriteIds: Set<number>;
  isLoading: boolean;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (wallpaperId: number) => Promise<void>;
  isFavorited: (wallpaperId: number) => boolean;
  syncToSupabase: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: loadFromLocalStorage(),
  isLoading: false,

  loadFavorites: async () => {
    set({ isLoading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        const { data } = await supabase
          .from("favorites")
          .select("wallpaper_id")
          .eq("user_id", session.session.user.id);
        if (data) {
          const ids = new Set(data.map((f) => f.wallpaper_id));
          saveToLocalStorage(ids);
          set({ favoriteIds: ids, isLoading: false });
          return;
        }
      }
    } catch {}
    set({ favoriteIds: loadFromLocalStorage(), isLoading: false });
  },

  toggleFavorite: async (wallpaperId: number) => {
    const { favoriteIds } = get();
    const newIds = new Set(favoriteIds);
    const wasFavorited = newIds.has(wallpaperId);

    if (wasFavorited) {
      newIds.delete(wallpaperId);
    } else {
      newIds.add(wallpaperId);
    }

    saveToLocalStorage(newIds);
    set({ favoriteIds: newIds });

    try {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        if (wasFavorited) {
          await supabase
            .from("favorites")
            .delete()
            .eq("user_id", session.session.user.id)
            .eq("wallpaper_id", wallpaperId);
        } else {
          await supabase.from("favorites").insert({
            user_id: session.session.user.id,
            wallpaper_id: wallpaperId,
          } as any);
        }
      }
    } catch (err) {
      // Keep local change even if Supabase sync fails (offline, no table, etc.)
      console.warn("Favorite sync failed (kept locally):", err);
    }
  },

  isFavorited: (wallpaperId: number) => get().favoriteIds.has(wallpaperId),

  syncToSupabase: async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const localIds = [...get().favoriteIds];
      const { data: remote } = await supabase
        .from("favorites")
        .select("wallpaper_id")
        .eq("user_id", session.session.user.id);

      const remoteIds = new Set((remote || []).map((f) => f.wallpaper_id));
      const toInsert = localIds.filter((id) => !remoteIds.has(id));

      if (toInsert.length > 0) {
        await supabase.from("favorites").insert(
          toInsert.map((wallpaper_id) => ({
            user_id: session.session!.user.id,
            wallpaper_id,
          })) as any
        );
      }
    } catch {}
  },
}));
