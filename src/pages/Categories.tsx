import { useState } from "react";
import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { Grid3X3, TreePine, Sparkles, Minus, Moon, Palette, Building2, Rocket, Bird } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useWallpapers";
import { CategoryDialog } from "@/components/categories/CategoryDialog";
import type { Category } from "@/types/database";

const ICON_MAP: Record<string, React.ElementType> = { TreePine, Sparkles, Minus, Moon, Palette, Building2, Rocket, Bird };

export function Categories() {
  const { data: categories = [], isLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  return (
    <>
      <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible" className="flex h-full flex-col gap-6 p-6">
        <motion.div variants={fadeInUp} className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5"><Grid3X3 className="h-6 w-6 text-primary" /></div>
          <div><h1 className="text-2xl font-bold tracking-tight">Categories</h1><p className="text-sm text-muted-foreground">Browse wallpapers by category</p></div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        ) : (
          <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => {
              const Icon = ICON_MAP[cat.icon || ""] || Grid3X3;
              return (
                <motion.button key={cat.id} variants={fadeInUp} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }} onClick={() => setSelectedCategory(cat)} className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-accent">
                  <div className="rounded-lg p-2.5" style={{ backgroundColor: `${cat.color}15` }}><Icon className="h-6 w-6" style={{ color: cat.color || "#71717a" }} /></div>
                  <div>
                    <h3 className="font-medium">{cat.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{cat.wallpaper_count} wallpapers</Badge>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {selectedCategory && (
        <CategoryDialog
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
          onPreview={() => {}}
        />
      )}
    </>
  );
}
