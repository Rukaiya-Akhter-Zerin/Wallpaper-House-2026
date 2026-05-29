import type { Variants, Transition } from "motion/react";

export const springConfigs = {
  snappy: { type: "spring" as const, stiffness: 400, damping: 30 },
  bouncy: { type: "spring" as const, stiffness: 300, damping: 15, mass: 0.8 },
  gentle: { type: "spring" as const, stiffness: 120, damping: 20 },
  stiff: { type: "spring" as const, stiffness: 500, damping: 40 },
} satisfies Record<string, Transition>;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springConfigs.gentle,
  },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfigs.gentle,
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springConfigs.gentle,
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springConfigs.gentle,
  },
};

export const staggerContainer = (delay = 0.06): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: delay,
    },
  },
});

export const cardHover = {
  whileHover: { scale: 1.02, y: -4, transition: springConfigs.snappy },
  whileTap: { scale: 0.98, transition: springConfigs.stiff },
};

const easeOut: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: easeOut } },
};

export function counterAnimation(from: number, to: number, duration = 1.5) {
  return {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { ...springConfigs.gentle, delay: 0.1 },
    },
    value: { from, to, duration },
  };
}
