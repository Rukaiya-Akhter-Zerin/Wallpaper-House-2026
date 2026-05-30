import { useAdminAppStore, type AdminView } from "@/stores/adminAppStore";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";

const viewTitles: Record<AdminView, string> = {
  dashboard: "Dashboard",
  wallpapers: "Wallpapers",
  "wallpaper-create": "Create Wallpaper",
  "wallpaper-edit": "Edit Wallpaper",
  featured: "Featured",
  "editors-choice": "Editors' Choice",
  popular: "Popular",
  categories: "Categories",
};

export default function AdminHeader() {
  const currentView = useAdminAppStore((s) => s.currentView);
  const user = useAdminAuthStore((s) => s.user);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Admin</span>
        <span>/</span>
        <span className="text-foreground font-medium">{viewTitles[currentView]}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-7 w-7 rounded-full bg-accent/20 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-accent" />
          </div>
          <span className="text-muted-foreground">{user?.email ?? "Admin"}</span>
        </div>
      </div>
    </header>
  );
}
