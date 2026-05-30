import { motion } from "motion/react";
import { heroTextVariants, springConfigs } from "@/lib/motion";

interface HeroHeaderProps {
  title: string;
  subtitle?: string;
}

export default function HeroHeader({ title, subtitle }: HeroHeaderProps) {
  return (
    <div className="mb-6" style={{ perspective: "600px" }}>
      <div className="flex flex-wrap">
        {title.split("").map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            custom={i}
            variants={heroTextVariants}
            initial="hidden"
            animate="visible"
            className="text-3xl font-bold text-foreground inline-block"
            style={{ transformOrigin: "bottom" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ ...springConfigs.gentle, delay: title.length * 0.03 + 0.1 }}
        className="mt-2 h-1 w-20 rounded-full bg-accent origin-left"
      />
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfigs.gentle, delay: title.length * 0.03 + 0.2 }}
          className="mt-2 text-muted-foreground"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
