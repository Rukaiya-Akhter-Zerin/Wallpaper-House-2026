import { motion } from "motion/react";
import {
  TreePine,
  Sparkles,
  Minus,
  Moon,
  Palette,
  Building2,
  Rocket,
  Bird,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { springConfigs } from "@/lib/motion";
import { useCategories } from "@/hooks/useWallpapers";
import type { Category } from "@/types/database";

const ICON_MAP: Record<string, React.ElementType> = {
  TreePine,
  Sparkles,
  Minus,
  Moon,
  Palette,
  Building2,
  Rocket,
  Bird,
};

interface CategoryTabsProps {
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
  className?: string;
}

export function CategoryTabs({ activeSlug, onSelect, className }: CategoryTabsProps) {
  const { data: categories = [] } = useCategories();

  const tabs = [{ slug: null, name: "All", icon: "LayoutGrid" }, ...categories];

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
        {tabs.map((tab) => {
          const isActive = tab.slug === activeSlug;
          const Icon = tab.slug === null ? LayoutGrid : ICON_MAP[tab.icon || ""] || Sparkles;
          const category = tab as Category & { slug: string | null };

          return (
            <button
              key={tab.slug ?? "all"}
              onClick={() => onSelect(tab.slug)}
              className={cn(
                "relative flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="category-tab-indicator"
                  className="absolute inset-0 rounded-lg bg-primary"
                  transition={springConfigs.snappy}
                  style={{ zIndex: 0 }}
                />
              )}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{tab.name}</span>
              {tab.slug !== null && category.wallpaper_count > 0 && (
                <span
                  className={cn(
                    "relative z-10 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {category.wallpaper_count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
