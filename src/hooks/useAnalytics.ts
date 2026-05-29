import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import type { Wallpaper, Category } from "@/types/database";

export function useUsageStats(days = 30) {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["usage-stats", user?.id, days],
    queryFn: async () => {
      if (!user) return [];
      const from = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
      const { data, error } = await supabase.from("usage_stats").select("*").eq("user_id", user.id).gte("date", from).order("date");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCategoryBreakdown() {
  return useQuery({
    queryKey: ["category-breakdown"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*, wallpapers(count)").order("sort_order");
      if (error) throw error;
      return data as (Category & { wallpapers: { count: number }[] })[];
    },
  });
}

export function useStreak() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["streak", user?.id],
    queryFn: async () => {
      if (!user) return { current: 0, best: 0 };
      const { data, error } = await supabase.from("usage_stats").select("date").eq("user_id", user.id).order("date", { ascending: false }).limit(365);
      if (error || !data) return { current: 0, best: 0 };
      const dates = data.map((d) => new Date(d.date).toDateString());
      let current = 0, best = 0, streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today.getTime() - i * 86400000).toDateString();
        if (dates.includes(d)) { streak++; best = Math.max(best, streak); if (i === current) current = streak; }
        else { if (i === current) break; streak = 0; }
      }
      return { current, best };
    },
    enabled: !!user,
  });
}
