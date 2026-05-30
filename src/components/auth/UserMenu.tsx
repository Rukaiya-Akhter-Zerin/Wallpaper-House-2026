import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, User, ChevronUp, Settings } from "lucide-react";
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
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    email.split("@")[0] ||
    "User";

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  const firstLetter = (email[0] || "U").toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted",
          collapsed ? "justify-center" : ""
        )}
      >
        {/* Circular avatar badge */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-background shadow-lg"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white ring-2 ring-background shadow-lg">
            {firstLetter}
          </div>
        )}
        {!collapsed && (
          <>
            <span className="truncate flex-1 text-left text-sm font-medium">{displayName}</span>
            <ChevronUp
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full z-50 mb-1 w-56 rounded-lg border border-border bg-card p-1 shadow-lg"
              style={{ left: collapsed ? "0" : "0" }}
            >
              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-2">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white">
                    {firstLetter}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{email}</p>
                </div>
              </div>
              <div className="my-1 h-px bg-border" />

              {/* Profile */}
              <button
                onClick={() => { setOpen(false); setCurrentView("profile"); }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <User className="h-4 w-4" />
                Profile
              </button>

              {/* Settings */}
              <button
                onClick={() => { setOpen(false); setCurrentView("settings"); }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>

              <div className="my-1 h-px bg-border" />

              {/* Sign Out */}
              <button
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
