import { MotionConfig } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Titlebar } from "./Titlebar";
import { Sidebar } from "./Sidebar";
import type { useTheme } from "@/hooks/useTheme";

interface AppLayoutProps {
  children: React.ReactNode;
  theme: ReturnType<typeof useTheme>["theme"];
  setTheme: ReturnType<typeof useTheme>["setTheme"];
  resolvedTheme: ReturnType<typeof useTheme>["resolvedTheme"];
}

export function AppLayout({ children, theme, setTheme, resolvedTheme }: AppLayoutProps) {
  const reducedMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
      <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
        <Titlebar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar theme={theme} setTheme={setTheme} resolvedTheme={resolvedTheme} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
