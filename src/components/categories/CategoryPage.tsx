import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperGrid";
import { useCategories, useWallpapers } from "@/hooks/useWallpapers";
import {
  TreePine,
  Sparkles,
  Minus,
  Moon,
  Palette,
  Building2,
  Rocket,
  Bird,
} from "lucide-react";
import type { Category, Wallpaper } from "@/types/database";

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

interface CategoryPageProps {
  slug: string;
  onBack: () => void;
  onPreview: (wallpaper: Wallpaper) => void;
  onFavorite?: (wallpaper: Wallpaper) => void;
  onDownload?: (wallpaper: Wallpaper) => void;
  favorites?: Set<number>;
}

export function CategoryPage({
  slug,
  onBack,
  onPreview,
  onFavorite,
  onDownload,
  favorites,
}: CategoryPageProps) {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const category = categories.find((c) => c.slug === slug);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useWallpapers({
    category_id: category?.id ?? null,
  });

  const wallpapers = data?.pages.flatMap((p) => p) ?? [];
  const Icon = category ? ICON_MAP[category.icon || ""] || Sparkles : Sparkles;

  if (categoriesLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <h3 className="text-lg font-semibold">Category not found</h3>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to gallery
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Back button */}
      <motion.div variants={fadeInUp}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All wallpapers
        </Button>
      </motion.div>

      {/* Category header */}
      <motion.div
        variants={fadeInUp}
        className="flex items-center gap-4 rounded-xl border border-border bg-card p-6"
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl"
          style={{ backgroundColor: category.color ? `${category.color}20` : undefined }}
        >
          <Icon
            className="h-7 w-7"
            style={{ color: category.color ?? undefined }}
          />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{category.name}</h2>
          {category.description && (
            <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
          )}
        </div>
        <Badge variant="secondary" className="text-sm">
          {category.wallpaper_count} wallpaper{category.wallpaper_count !== 1 ? "s" : ""}
        </Badge>
      </motion.div>

      {/* Wallpaper grid */}
      <motion.div variants={fadeInUp}>
        <WallpaperGrid
          wallpapers={wallpapers}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          onPreview={onPreview}
          onFavorite={onFavorite}
          onDownload={onDownload}
          favorites={favorites}
        />
      </motion.div>
    </motion.div>
  );
}
