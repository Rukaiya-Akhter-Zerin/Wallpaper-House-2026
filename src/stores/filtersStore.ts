import { create } from 'zustand';

export type SortOption = 'newest' | 'popular' | 'trending' | 'downloads';
export type Orientation = 'portrait' | 'landscape' | 'square';

interface FiltersState {
  categorySlug: string | null;
  resolution: string | null;
  orientation: Orientation | null;
  sort: SortOption;
  searchQuery: string;
  setCategory: (slug: string | null) => void;
  setResolution: (res: string | null) => void;
  setOrientation: (o: Orientation | null) => void;
  setSort: (s: SortOption) => void;
  setSearchQuery: (q: string) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

export const useFiltersStore = create<FiltersState>((set, get) => ({
  categorySlug: null,
  resolution: null,
  orientation: null,
  sort: 'newest',
  searchQuery: '',
  setCategory: (slug) => set({ categorySlug: slug }),
  setResolution: (res) => set({ resolution: res }),
  setOrientation: (o) => set({ orientation: o }),
  setSort: (s) => set({ sort: s }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  clearFilters: () => set({ categorySlug: null, resolution: null, orientation: null, sort: 'newest', searchQuery: '' }),
  hasActiveFilters: () => {
    const s = get();
    return !!(s.categorySlug || s.resolution || s.orientation || s.searchQuery || s.sort !== 'newest');
  },
}));
