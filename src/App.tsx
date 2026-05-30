import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Categories } from "@/pages/Categories";
import { Favorites } from "@/pages/Favorites";
import { Collections } from "@/pages/Collections";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { pageTransition } from "@/lib/motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastContainer } from "@/components/ui/toast-container";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function CurrentPage() {
  const currentView = useAppStore((s) => s.currentView);

  const pages: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    categories: <Categories />,
    favorites: <Favorites />,
    collections: <Collections />,
    analytics: <AnalyticsPage />,
    settings: <SettingsPage />,
    profile: <ProfilePage />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div key={currentView} {...pageTransition} className="h-full">
        {pages[currentView] ?? <Dashboard />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const themeHook = useTheme();
  const loadSession = useAuthStore((s) => s.loadSession);
  const loadFavorites = useFavoritesStore((s) => s.loadFavorites);

  // Load auth session and favorites on app startup
  useEffect(() => {
    loadSession();
    loadFavorites();
  }, [loadSession, loadFavorites]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <AppLayout
          theme={themeHook.theme}
          setTheme={themeHook.setTheme}
          resolvedTheme={themeHook.resolvedTheme}
        >
          <CurrentPage />
        </AppLayout>
        <ToastContainer />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
