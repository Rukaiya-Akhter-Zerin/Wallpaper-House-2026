import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface NeomorphicCardProps {
  children: ReactNode;
  variant?: "raised" | "inset" | "flat" | "convex";
  className?: string;
  onClick?: () => void;
}

const variantClasses = {
  raised: "neomorphic",
  inset: "neomorphic-inset",
  flat: "neomorphic-flat",
  convex: "neomorphic-convex",
};

export default function NeomorphicCard({ children, variant = "raised", className, onClick }: NeomorphicCardProps) {
  return (
    <div className={cn(variantClasses[variant], "p-4", onClick && "cursor-pointer neomorphic-press", className)} onClick={onClick}>
      {children}
    </div>
  );
}
