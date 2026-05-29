import { motion, AnimatePresence } from "motion/react";
import { X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFilters, type Resolution, type Orientation, type SortOption } from "@/hooks/useFilters";

const RESOLUTIONS: Resolution[] = ["4K", "2K", "1080p", "ultrawide"];
const ORIENTATIONS: Orientation[] = ["portrait", "landscape", "square"];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "trending", label: "Trending" },
  { value: "downloads", label: "Most Downloaded" },
];

interface FilterPanelProps {
  className?: string;
}

export function FilterPanel({ className }: FilterPanelProps) {
  const {
    resolutions,
    orientations,
    sort,
    toggleResolution,
    toggleOrientation,
    setSort,
    clearFilters,
    hasActiveFilters,
  } = useFilters();

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        <span className="hidden sm:inline">Filters</span>
      </div>

      {/* Resolution badges */}
      <div className="flex items-center gap-1.5">
        {RESOLUTIONS.map((r) => (
          <Badge
            key={r}
            variant={resolutions.includes(r) ? "default" : "outline"}
            className="cursor-pointer select-none transition-colors hover:bg-primary/80"
            onClick={() => toggleResolution(r)}
          >
            {r}
          </Badge>
        ))}
      </div>

      <div className="h-5 w-px bg-border" />

      {/* Orientation badges */}
      <div className="flex items-center gap-1.5">
        {ORIENTATIONS.map((o) => (
          <Badge
            key={o}
            variant={orientations.includes(o) ? "default" : "outline"}
            className="cursor-pointer select-none capitalize transition-colors hover:bg-primary/80"
            onClick={() => toggleOrientation(o)}
          >
            {o}
          </Badge>
        ))}
      </div>

      <div className="h-5 w-px bg-border" />

      {/* Sort dropdown */}
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="appearance-none rounded-md border border-border bg-card px-3 py-1.5 pr-8 text-sm capitalize outline-none focus:ring-1 focus:ring-ring"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>

      {/* Active filters & clear */}
      <AnimatePresence>
        {hasActiveFilters() && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5"
          >
            <div className="h-5 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
