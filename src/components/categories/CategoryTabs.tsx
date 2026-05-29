import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useFiltersStore } from "@/stores/filtersStore";
import { useCategories } from "@/hooks/useWallpapers";
import { TreePine, Sparkles, Minus, Moon, Palette, Building2, Rocket, Bird, LayoutGrid } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  TreePine, Sparkles, Minus, Moon, Palette, Building2, Rocket, Bird,
};

export function CategoryTabs({ className }: { className?: string }) {
  const { categorySlug, setCategory } = useFiltersStore();
  const { data: categories = [] } = useCategories();

  const tabs = [{ slug: null, name: "All", icon: LayoutGrid, color: "#71717a" }, ...categories.map((c) => ({ slug: c.slug, name: c.name, icon: ICON_MAP[c.icon || ""] || LayoutGrid, color: c.color || "#71717a" }))];

  return (
    <div className={cn("flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide", className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = categorySlug === tab.slug;
        return (
          <motion.button key={tab.slug || "all"} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setCategory(tab.slug)} className={cn("relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
            {isActive && <motion.div layoutId="category-indicator" className="absolute inset-0 rounded-lg bg-muted" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
            <Icon className="relative z-10 h-4 w-4" style={{ color: isActive ? tab.color : undefined }} />
            <span className="relative z-10">{tab.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
