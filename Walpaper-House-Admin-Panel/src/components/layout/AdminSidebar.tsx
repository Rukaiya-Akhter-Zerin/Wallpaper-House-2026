import { motion } from "motion/react";
import { LayoutDashboard, Image, Star, Award, TrendingUp, FolderTree, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useAdminAppStore, type AdminView } from "@/stores/adminAppStore";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import { cn } from "@/lib/utils";
import { springConfigs } from "@/lib/motion";

interface NavItem {
  id: AdminView;
  label: string;
  icon: React.ElementType;
  color: string;
  glow: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-violet-400", glow: "shadow-[0_0_12px_rgba(167,139,250,0.3)]" },
  { id: "wallpapers", label: "Wallpapers", icon: Image, color: "text-sky-400", glow: "shadow-[0_0_12px_rgba(56,189,248,0.3)]" },
  { id: "featured", label: "Featured", icon: Star, color: "text-amber-400", glow: "shadow-[0_0_12px_rgba(251,191,36,0.3)]" },
  { id: "editors-choice", label: "Editors' Choice", icon: Award, color: "text-rose-400", glow: "shadow-[0_0_12px_rgba(251,113,133,0.3)]" },
  { id: "popular", label: "Popular", icon: TrendingUp, color: "text-emerald-400", glow: "shadow-[0_0_12px_rgba(52,211,153,0.3)]" },
  { id: "categories", label: "Categories", icon: FolderTree, color: "text-orange-400", glow: "shadow-[0_0_12px_rgba(251,146,60,0.3)]" },
];

export default function AdminSidebar() {
  const currentView = useAdminAppStore((s) => s.currentView);
  const collapsed = useAdminAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAdminAppStore((s) => s.toggleSidebar);
  const setCurrentView = useAdminAppStore((s) => s.setCurrentView);
  const signOut = useAdminAuthStore((s) => s.signOut);

  return (
    <motion.aside
      className="fixed left-0 top-0 z-40 flex h-full flex-col border-r border-sidebar-border bg-sidebar"
      animate={{ width: collapsed ? 64 : 220 }}
      transition={springConfigs.gentle}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-bold text-sidebar-foreground tracking-wider"
          >
            WH ADMIN
          </motion.span>
        )}
        {collapsed && (
          <span className="text-sm font-bold text-accent mx-auto">WH</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? `bg-sidebar-accent ${item.color} ${item.glow}`
                  : "text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4 mx-auto" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
        </button>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
