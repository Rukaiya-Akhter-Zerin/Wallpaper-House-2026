import { motion } from "motion/react";
import HeroHeader from "@/components/shared/HeroHeader";
import PopularWallpapers from "@/components/popular/PopularWallpapers";

export default function PopularPage() {
  return (
    <motion.div {...{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }}>
      <HeroHeader title="Popular" subtitle="Top wallpapers by download count" />
      <PopularWallpapers />
    </motion.div>
  );
}
