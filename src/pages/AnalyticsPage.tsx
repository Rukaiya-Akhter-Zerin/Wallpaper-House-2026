import { motion } from "motion/react";
import { BarChart3, TrendingUp, Flame, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { useUsageStats, useCategoryBreakdown, useStreak } from "@/hooks/useAnalytics";
import { useAuthStore } from "@/stores/authStore";

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg p-2" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function AnalyticsPage() {
  const { isAuthenticated } = useAuthStore();
  const { data: usageStats } = useUsageStats();
  const { data: categories } = useCategoryBreakdown();
  const { data: streak } = useStreak();

  if (!isAuthenticated) {
    return (
      <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible" className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <motion.div variants={fadeInUp} className="rounded-xl bg-primary/10 p-4">
          <BarChart3 className="h-10 w-10 text-primary" />
        </motion.div>
        <motion.div variants={fadeInUp} className="text-center">
          <h2 className="text-xl font-bold">Sign in to view analytics</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track your wallpaper usage, favorites, and browsing patterns</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible" className="flex h-full flex-col gap-6 p-6">
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Your wallpaper usage insights</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Image} label="Wallpapers Viewed" value={usageStats?.length ?? 0} color="#3b82f6" />
        <StatCard icon={Flame} label="Current Streak" value={`${streak?.current ?? 0} days`} color="#ef4444" />
        <StatCard icon={TrendingUp} label="Best Streak" value={`${streak?.best ?? 0} days`} color="#22c55e" />
      </div>

      <motion.div variants={fadeInUp} className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-lg font-semibold">Category Breakdown</h3>
        <div className="space-y-3">
          {categories?.map((cat) => {
            const count = cat.wallpapers?.[0]?.count ?? 0;
            return (
              <div key={cat.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color ?? "#71717a" }} />
                  <span className="text-sm">{cat.name}</span>
                </div>
                <Badge variant="secondary">{count} wallpapers</Badge>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
