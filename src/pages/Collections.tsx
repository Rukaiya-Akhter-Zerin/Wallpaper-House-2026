import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { FolderOpen } from "lucide-react";

export function Collections() {
  return (
    <motion.div
      variants={staggerContainer(0.1)}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col items-center justify-center gap-6 p-8"
    >
      <motion.div variants={fadeInUp}>
        <div className="rounded-2xl bg-primary/10 p-4">
          <FolderOpen className="h-12 w-12 text-primary" />
        </div>
      </motion.div>
      <motion.div variants={fadeInUp} className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
        <p className="mt-2 text-muted-foreground">Organize wallpapers into custom playlists</p>
      </motion.div>
    </motion.div>
  );
}
