import { motion } from "motion/react";
import { staggerContainer } from "@/lib/motion";
import { useAdminStats } from "@/hooks/useAdminStats";
import HeroHeader from "@/components/shared/HeroHeader";
import StatCard from "@/components/shared/StatCard";
import { Image, Star, Award, TrendingUp, FolderTree, Download, Upload, Eye } from "lucide-react";

export default function DashboardPage() {
  const { data: stats } = useAdminStats();

  const statItems = [
    { icon: Image, label: "Total Wallpapers", value: stats?.totalWallpapers ?? 0, color: "text-sky-400" },
    { icon: Eye, label: "Active", value: stats?.activeWallpapers ?? 0, color: "text-emerald-400" },
    { icon: Star, label: "Featured", value: stats?.featuredCount ?? 0, color: "text-amber-400" },
    { icon: Award, label: "Editors' Choice", value: stats?.editorsChoiceCount ?? 0, color: "text-rose-400" },
    { icon: TrendingUp, label: "Popular (1k+)", value: stats?.popularCount ?? 0, color: "text-violet-400" },
    { icon: FolderTree, label: "Categories", value: stats?.categoriesCount ?? 0, color: "text-orange-400" },
    { icon: Download, label: "Total Downloads", value: stats?.totalDownloads?.toLocaleString() ?? "0", color: "text-blue-400" },
    { icon: Upload, label: "Recent (7d)", value: stats?.recentUploads ?? 0, color: "text-pink-400" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <HeroHeader title="Dashboard" subtitle="Overview of your wallpaper collection" />
      <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, i) => (
          <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} color={item.color} delay={i * 0.05} />
        ))}
      </motion.div>
    </motion.div>
  );
}
