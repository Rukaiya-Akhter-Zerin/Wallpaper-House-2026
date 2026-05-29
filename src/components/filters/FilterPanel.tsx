import { motion } from "motion/react";
import { X, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFiltersStore, type SortOption, type Orientation } from "@/stores/filtersStore";

const RESOLUTIONS = ["4K", "2K", "1080p", "Ultrawide"];
const ORIENTATIONS: Orientation[] = ["landscape", "portrait", "square"];
const SORTS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "trending", label: "Trending" },
  { value: "downloads", label: "Most Downloaded" },
];

export function FilterPanel({ className }: { className?: string }) {
  const { resolution, orientation, sort, setResolution, setOrientation, setSort, clearFilters, hasActiveFilters } = useFiltersStore();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><SlidersHorizontal className="h-4 w-4" />Resolution:</div>
        {RESOLUTIONS.map((r) => (
          <motion.button key={r} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setResolution(resolution === r ? null : r)}>
            <Badge variant={resolution === r ? "default" : "outline"} className="cursor-pointer">{r}</Badge>
          </motion.button>
        ))}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><SlidersHorizontal className="h-4 w-4" />Orientation:</div>
        {ORIENTATIONS.map((o) => (
          <motion.button key={o} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setOrientation(orientation === o ? null : o)}>
            <Badge variant={orientation === o ? "default" : "outline"} className="cursor-pointer capitalize">{o}</Badge>
          </motion.button>
        ))}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><SlidersHorizontal className="h-4 w-4" />Sort:</div>
        {SORTS.map((s) => (
          <motion.button key={s.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSort(s.value)}>
            <Badge variant={sort === s.value ? "default" : "outline"} className="cursor-pointer">{s.label}</Badge>
          </motion.button>
        ))}
      </div>
      {hasActiveFilters() && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground"><X className="mr-1 h-3 w-3" />Clear all filters</Button>
        </motion.div>
      )}
    </div>
  );
}
