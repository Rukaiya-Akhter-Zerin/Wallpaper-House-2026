import { create } from "zustand";

interface SelectionState {
  selectedIds: Set<number>;
  toggle: (id: number) => void;
  toggleAll: (ids: number[]) => void;
  clearSelection: () => void;
  isSelected: (id: number) => boolean;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedIds: new Set(),
  toggle: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),
  toggleAll: (ids) =>
    set((s) => {
      const allSelected = ids.every((id) => s.selectedIds.has(id));
      if (allSelected) return { selectedIds: new Set() };
      return { selectedIds: new Set(ids) };
    }),
  clearSelection: () => set({ selectedIds: new Set() }),
  isSelected: (id) => get().selectedIds.has(id),
}));
