import { create } from "zustand";

export type Resolution = "4K" | "2K" | "1080p" | "ultrawide";
export type Orientation = "portrait" | "landscape" | "square";
export type SortOption = "popular" | "newest" | "trending" | "downloads";

interface FilterState {
  category: string | null;
  resolutions: Resolution[];
  orientations: Orientation[];
  sort: SortOption;
  color: string | null;

  setCategory: (category: string | null) => void;
  toggleResolution: (r: Resolution) => void;
  toggleOrientation: (o: Orientation) => void;
  setSort: (sort: SortOption) => void;
  setColor: (color: string | null) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

export const useFilters = create<FilterState>((set, get) => ({
  category: null,
  resolutions: [],
  orientations: [],
  sort: "popular",
  color: null,

  setCategory: (category) => set({ category }),

  toggleResolution: (r) =>
    set((s) => ({
      resolutions: s.resolutions.includes(r)
        ? s.resolutions.filter((x) => x !== r)
        : [...s.resolutions, r],
    })),

  toggleOrientation: (o) =>
    set((s) => ({
      orientations: s.orientations.includes(o)
        ? s.orientations.filter((x) => x !== o)
        : [...s.orientations, o],
    })),

  setSort: (sort) => set({ sort }),

  setColor: (color) => set({ color }),

  clearFilters: () =>
    set({ category: null, resolutions: [], orientations: [], color: null }),

  hasActiveFilters: () => {
    const s = get();
    return (
      s.category !== null ||
      s.resolutions.length > 0 ||
      s.orientations.length > 0 ||
      s.color !== null
    );
  },
}));
