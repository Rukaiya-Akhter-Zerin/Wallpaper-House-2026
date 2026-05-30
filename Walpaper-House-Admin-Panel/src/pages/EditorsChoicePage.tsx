import { motion } from "motion/react";
import HeroHeader from "@/components/shared/HeroHeader";
import EditorsChoiceManager from "@/components/editors-choice/EditorsChoiceManager";

export default function EditorsChoicePage() {
  return (
    <motion.div {...{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }}>
      <HeroHeader title="Editors' Choice" subtitle="Curate the editors' choice collection" />
      <EditorsChoiceManager />
    </motion.div>
  );
}
