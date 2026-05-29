import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { Heart } from "lucide-react";
import { useFavoriteWallpapers, useFavorites } from "@/hooks/useFavorites";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteToggle } from "@/components/favorites/FavoriteToggle";

export function Favorites() {
  useFavorites();
  const { data: wallpapers, isLoading } = useFavoriteWallpapers();

  return (
    <motion.div
      variants={staggerContainer(0.06)}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col gap-6 p-6"
    >
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        <div className="rounded-xl bg-red-500/10 p-2.5">
          <Heart className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Favorites</h1>
          <p className="text-sm text-muted-foreground">
            {wallpapers?.length ?? 0} wallpaper{wallpapers?.length !== 1 ? "s" : ""}
          </p>
        </div>
      </motion.div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && (!wallpapers || wallpapers.length === 0) && (
        <motion.div
          variants={fadeInUp}
          className="flex flex-1 flex-col items-center justify-center gap-4"
        >
          <div className="rounded-2xl bg-muted p-6">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">No favorites yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap the heart on any wallpaper to save it here
            </p>
          </div>
        </motion.div>
      )}

      {!isLoading && wallpapers && wallpapers.length > 0 && (
        <motion.div
          variants={staggerContainer(0.04)}
          className="columns-2 gap-4 md:columns-3 lg:columns-4"
        >
          {wallpapers.map((wp) => (
            <motion.div
              key={wp.id}
              variants={fadeInUp}
              className="relative mb-4 break-inside-avoid group"
            >
              <img
                src={wp.thumbnail_url_medium || wp.image_url}
                alt={wp.title}
                loading="lazy"
                className="w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute top-2 right-2">
                <FavoriteToggle wallpaperId={wp.id} />
              </div>
              <div className="absolute inset-x-2 bottom-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                  <p className="text-xs font-medium text-white truncate">{wp.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
