import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "motion/react";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import { useAdminAppStore } from "@/stores/adminAppStore";
import AdminLoginPage from "@/components/auth/AdminLoginPage";
import AdminLayout from "@/components/layout/AdminLayout";
import { ToastContainer } from "@/components/ui/toast-container";
import DashboardPage from "@/pages/DashboardPage";
import WallpapersPage from "@/pages/WallpapersPage";
import WallpaperCreatePage from "@/pages/WallpaperCreatePage";
import WallpaperEditPage from "@/pages/WallpaperEditPage";
import FeaturedPage from "@/pages/FeaturedPage";
import EditorsChoicePage from "@/pages/EditorsChoicePage";
import PopularPage from "@/pages/PopularPage";
import CategoriesPage from "@/pages/CategoriesPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

function CurrentPage() {
  const currentView = useAdminAppStore((s) => s.currentView);

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    wallpapers: <WallpapersPage />,
    "wallpaper-create": <WallpaperCreatePage />,
    "wallpaper-edit": <WallpaperEditPage />,
    featured: <FeaturedPage />,
    "editors-choice": <EditorsChoicePage />,
    popular: <PopularPage />,
    categories: <CategoriesPage />,
  };

  return (
    <AnimatePresence mode="wait">
      {pages[currentView] ?? <DashboardPage />}
    </AnimatePresence>
  );
}

export default function App() {
  const isAdmin = useAdminAuthStore((s) => s.isAdmin);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isAdmin ? (
          <AdminLayout>
            <CurrentPage />
          </AdminLayout>
        ) : (
          <AdminLoginPage />
        )}
        <ToastContainer />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
