import { motion } from "motion/react";
import { fadeInUp, springConfigs } from "@/lib/motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color?: string;
  delay?: number;
}

export default function StatCard({ icon: Icon, label, value, color = "text-accent", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ ...springConfigs.bouncy, delay }}
      className="neomorphic p-5 flex items-center gap-4"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}
