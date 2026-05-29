import { useState, useRef, useEffect, useDeferredValue } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Clock, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFiltersStore } from "@/stores/filtersStore";

const RECENT_KEY = "wh-search-recent";

function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function saveRecentSearch(q: string) {
  if (!q.trim()) return;
  const recent = getRecentSearches().filter((s) => s !== q);
  recent.unshift(q);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 10)));
}

export function SearchBar({ className }: { className?: string }) {
  const [focused, setFocused] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchQuery = useFiltersStore((s) => s.searchQuery);
  const setSearchQuery = useFiltersStore((s) => s.setSearchQuery);
  const deferredQuery = useDeferredValue(searchQuery);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => { setRecent(getRecentSearches()); }, [focused]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); inputRef.current?.focus(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(deferredQuery), 300);
    return () => clearTimeout(timer);
  }, [deferredQuery, setSearchQuery]);

  const selectRecent = (q: string) => { setSearchQuery(q); setShowRecent(false); inputRef.current?.focus(); };
  const clearRecent = () => { localStorage.removeItem(RECENT_KEY); setRecent([]); };

  return (
    <div className={cn("relative", className)}>
      <div className={cn("flex items-center gap-2 rounded-xl border bg-card px-3 py-2 transition-all", focused ? "border-accent ring-2 ring-accent/20" : "border-border")}>
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input ref={inputRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => { setFocused(true); setShowRecent(true); }} onBlur={() => { setFocused(false); setTimeout(() => setShowRecent(false), 200); }} placeholder="Search wallpapers... (Ctrl+K)" className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" />
        {searchQuery && (
          <motion.button initial={{ rotate: 0 }} animate={{ rotate: 90 }} whileHover={{ scale: 1.1 }} onClick={() => setSearchQuery("")} className="shrink-0 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </div>
      <AnimatePresence>
        {showRecent && recent.length > 0 && !searchQuery && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-border bg-card p-2 shadow-lg">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-medium text-muted-foreground">Recent searches</span>
              <button onClick={clearRecent} className="text-xs text-muted-foreground hover:text-foreground"><Trash2 className="h-3 w-3" /></button>
            </div>
            {recent.map((q) => (
              <button key={q} onClick={() => selectRecent(q)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
                <Clock className="h-3 w-3 text-muted-foreground" />{q}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
