import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, User, ChevronUp } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  collapsed: boolean;
  onSignInClick: () => void;
}

export function UserMenu({ collapsed, onSignInClick }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, isAnonymous, signOut } = useAuthStore();

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

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  const email = user?.email || "";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        )}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-[18px] w-[18px] shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        {!collapsed && (
          <>
            <span className="truncate flex-1 text-left">{displayName}</span>
            <ChevronUp
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-transform",
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
              className={cn(
                "absolute bottom-full z-50 mb-1 w-56 rounded-lg border border-border bg-card p-1 shadow-lg",
                collapsed ? "left-0" : "left-0"
              )}
            >
              {/* User Info */}
              <div className="px-3 py-2">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {email}
                </p>
              </div>
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
