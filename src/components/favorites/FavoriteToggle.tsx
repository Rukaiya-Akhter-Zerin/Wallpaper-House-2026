import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { springConfigs } from "@/lib/motion";
import { useFavoritesStore } from "@/stores/favoritesStore";

export function FavoriteToggle({ wallpaperId, size = 20, className }: { wallpaperId: number; size?: number; className?: string }) {
  const isFavorited = useFavoritesStore((s) => s.isFavorited(wallpaperId));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      animate={isFavorited ? { scale: [1, 1.3, 1], transition: springConfigs.bouncy } : { scale: 1 }}
      onClick={(e) => { e.stopPropagation(); toggleFavorite(wallpaperId); }}
      className={cn("flex items-center justify-center rounded-full transition-colors", isFavorited ? "text-red-500" : "text-muted-foreground hover:text-red-400", className)}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorited}
    >
      <Heart style={{ width: size, height: size }} className={cn("transition-all duration-200", isFavorited ? "fill-red-500 stroke-red-500" : "stroke-current")} />
    </motion.button>
  );
}
