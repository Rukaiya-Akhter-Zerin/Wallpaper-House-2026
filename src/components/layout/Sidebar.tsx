import { useState } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Grid3X3,
  Heart,
  FolderOpen,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Monitor,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type ViewName } from "@/stores/appStore";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import type { useTheme } from "@/hooks/useTheme";

interface NavItem {
  id: ViewName;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Gallery", icon: LayoutDashboard },
  { id: "categories", label: "Categories", icon: Grid3X3 },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "collections", label: "Collections", icon: FolderOpen },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  theme: ReturnType<typeof useTheme>["theme"];
  setTheme: ReturnType<typeof useTheme>["setTheme"];
  resolvedTheme: ReturnType<typeof useTheme>["resolvedTheme"];
}

export function Sidebar({ theme, setTheme, resolvedTheme }: SidebarProps) {
  const { sidebarCollapsed, currentView, setCurrentView, toggleSidebar } = useAppStore();
  const [authOpen, setAuthOpen] = useState(false);

  const cycleTheme = () => {
    const order: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
    const idx = order.indexOf(theme as "light" | "dark" | "system");
    setTheme(order[(idx + 1) % order.length]);
  };

  const ThemeIcon = theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <>
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex h-full flex-col border-r border-border bg-card/50 backdrop-blur-sm"
    >
      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className="relative z-10 h-[18px] w-[18px] shrink-0" />
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border px-2 py-3">
        <UserMenu collapsed={sidebarCollapsed} onSignInClick={() => setAuthOpen(true)} />
        <button
          onClick={cycleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ThemeIcon className="h-[18px] w-[18px] shrink-0" />
          {!sidebarCollapsed && (
            <span className="truncate capitalize">{theme}</span>
          )}
        </button>
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="h-[18px] w-[18px] shrink-0" />
          ) : (
            <ChevronsLeft className="h-[18px] w-[18px] shrink-0" />
          )}
          {!sidebarCollapsed && <span className="truncate">Collapse</span>}
        </button>
      </div>
    </motion.aside>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
