import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const RECENT_KEY = "wh-search-recent";

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function clearAll() { localStorage.removeItem(RECENT_KEY); }
function removeOne(q: string) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(getRecent().filter((s) => s !== q)));
}

interface SearchSuggestionsProps {
  visible: boolean;
  onSelect: (term: string) => void;
  className?: string;
}

export function SearchSuggestions({ visible, onSelect, className }: SearchSuggestionsProps) {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    if (visible) setSearches(getRecent());
  }, [visible]);

  if (!visible || searches.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-lg",
          className
        )}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">Recent searches</span>
          <button
            onClick={() => { clearAll(); setSearches([]); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-3 w-3" />
            Clear all
          </button>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {searches.map((term) => (
            <div
              key={term}
              className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer group"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(term)}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">{term}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeOne(term);
                  setSearches(getRecent());
                }}
                className="hidden rounded p-0.5 hover:bg-background group-hover:block"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
