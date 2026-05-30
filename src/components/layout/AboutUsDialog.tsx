import { motion, AnimatePresence } from "motion/react";
import { X, Wallpaper, Github, Heart } from "lucide-react";

interface AboutUsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AboutUsDialog({ open, onClose }: AboutUsDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[70] flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 100, filter: "blur(24px)" }}
            animate={{ scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ scale: 0.6, opacity: 0, y: 60, filter: "blur(16px)" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-[420px] overflow-hidden rounded-2xl bg-background/95 backdrop-blur-md border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero banner */}
            <div className="relative h-40 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 overflow-hidden">
              <motion.div
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.15 }}
                transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_60%)]" />
              </motion.div>
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg">
                  <Wallpaper className="h-8 w-8 text-white" />
                </div>
              </motion.div>

              <button
                onClick={onClose}
                className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-black/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="p-6 text-center"
            >
              <h2 className="text-xl font-bold tracking-tight">Wallpaper House</h2>
              <p className="mt-1 text-sm text-muted-foreground">Your desktop, reimagined.</p>

              <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                <p>
                  A beautiful wallpaper manager built with Tauri + React.
                  Browse, download, and set stunning wallpapers for your desktop.
                </p>
                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">4K+</p>
                    <p className="text-xs">Wallpapers</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">50+</p>
                    <p className="text-xs">Categories</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">Free</p>
                    <p className="text-xs">Forever</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>Made with</span>
                <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />
                <span>by Wallpaper House Team</span>
              </div>

              <p className="mt-3 text-[10px] text-muted-foreground/50">Version 1.0.0</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
