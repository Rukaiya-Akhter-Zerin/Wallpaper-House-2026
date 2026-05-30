import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, User, Settings } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  collapsed: boolean;
  onSignInClick: () => void;
}

export function UserMenu({ collapsed, onSignInClick }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, isAnonymous, signOut } = useAuthStore();
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  if (!isAuthenticated || isAnonymous) {
    return (
      <button
        onClick={onSignInClick}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        )}
      >
        <User className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span className="truncate">Sign In</span>}
      </button>
    );
  }

  const email = user?.email || "";
  const firstLetter = email[0]?.toUpperCase() || "U";
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted",
          collapsed ? "justify-center" : "items-center"
        )}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/10"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-lg font-bold text-white shadow-lg shadow-purple-500/20 ring-2 ring-purple-500/20">
            {firstLetter}
          </div>
        )}
        {!collapsed && (
          <span className="truncate text-sm font-medium text-foreground">{email}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-full z-50 mb-2 w-56 overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-xl backdrop-blur-xl"
            >
              <div className="px-3 py-2.5 border-b border-border/50">
                <p className="text-sm font-medium truncate">{user?.user_metadata?.full_name || email.split("@")[0]}</p>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { setOpen(false); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => { setOpen(false); setCurrentView("settings"); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <div className="my-1 h-px bg-border/50" />
                <button
                  onClick={() => { setOpen(false); signOut(); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
