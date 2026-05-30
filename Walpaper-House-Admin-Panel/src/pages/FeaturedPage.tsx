import { motion } from "motion/react";
import HeroHeader from "@/components/shared/HeroHeader";
import FeaturedManager from "@/components/featured/FeaturedManager";

export default function FeaturedPage() {
  return (
    <motion.div {...{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }}>
      <HeroHeader title="Featured" subtitle="Manage featured wallpapers shown in the carousel" />
      <FeaturedManager />
    </motion.div>
  );
}
