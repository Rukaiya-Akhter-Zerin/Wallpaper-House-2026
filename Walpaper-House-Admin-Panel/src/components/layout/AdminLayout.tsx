import { MotionConfig } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useAdminAppStore } from "@/stores/adminAppStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const sidebarCollapsed = useAdminAppStore((s) => s.sidebarCollapsed);

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden" style={{ marginLeft: sidebarCollapsed ? 64 : 220, transition: "margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
