import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { Image, Sparkles } from "lucide-react";

export function Dashboard() {
  return (
    <motion.div
      variants={staggerContainer(0.1)}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col items-center justify-center gap-6 p-8"
    >
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-4">
          <Image className="h-12 w-12 text-primary" />
        </div>
      </motion.div>
      <motion.div variants={fadeInUp} className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Wallpaper Gallery</h1>
        <p className="mt-2 text-muted-foreground">
          Discover and set beautiful wallpapers from around the world
        </p>
      </motion.div>
      <motion.div
        variants={fadeInUp}
        className="flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-sm text-muted-foreground"
      >
        <Sparkles className="h-4 w-4" />
        <span>Wallpapers will appear here in Chunk 5</span>
      </motion.div>
    </motion.div>
  );
}
