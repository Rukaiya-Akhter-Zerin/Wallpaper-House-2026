import { motion, AnimatePresence } from "motion/react";
import { X, Download, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpdateDialogProps {
  open: boolean;
  onClose: () => void;
}

export function UpdateDialog({ open, onClose }: UpdateDialogProps) {
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
            <div className="relative h-40 bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-400 overflow-hidden">
              <motion.div
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.15 }}
                transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.3),transparent_60%)]" />
              </motion.div>
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
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
              className="p-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  You're up to date
                </div>
                <h2 className="mt-3 text-xl font-bold tracking-tight">Wallpaper House v1.0.0</h2>
                <p className="mt-1 text-sm text-muted-foreground">Latest version installed</p>
              </div>

              <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">What's New</p>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Beautiful gallery with infinite scroll</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>One-click wallpaper setting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Favorites & custom collections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Dark & light theme support</span>
                  </li>
                </ul>
              </div>

              <div className="mt-5 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Close
                </Button>
                <Button className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Download className="h-4 w-4" />
                  Check for Updates
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
