import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { useUpdateWallpaper } from "@/hooks/useAdminWallpapers";
import { useToastStore } from "@/stores/toastStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp } from "lucide-react";
import type { Wallpaper } from "@/types/database";

export default function PopularWallpapers() {
  const updateMutation = useUpdateWallpaper();
  const addToast = useToastStore((s) => s.addToast);

  const { data: popular = [] } = useQuery({
    queryKey: ["admin-popular"],
    queryFn: async () => {
      const { data } = await supabaseAdmin.from("wallpapers").select("*, categories(name)").eq("is_active", true).order("downloads_count", { ascending: false }).limit(50);
      return (data ?? []) as (Wallpaper & { categories?: { name: string } | null })[];
    },
  });

  const boostToFeatured = async (wp: Wallpaper) => {
    try { await updateMutation.mutateAsync({ id: wp.id, is_featured: true }); addToast(`"${wp.title}" boosted to featured`, "success"); }
    catch { addToast("Failed to boost", "error"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-400" /><h3 className="text-lg font-semibold">Top 50 by Downloads</h3></div>
      <Table>
        <TableHeader><TableRow><TableHead className="w-10">#</TableHead><TableHead className="w-16">Image</TableHead><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Downloads</TableHead><TableHead>Likes</TableHead><TableHead>Featured</TableHead><TableHead className="w-24">Action</TableHead></TableRow></TableHeader>
        <TableBody>
          {popular.map((wp, i) => (
            <TableRow key={wp.id}>
              <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
              <TableCell><div className="h-10 w-14 overflow-hidden rounded-md bg-muted"><img src={wp.thumbnail_url_small ?? wp.image_url} alt={wp.title} className="h-full w-full object-cover" loading="lazy" /></div></TableCell>
              <TableCell className="font-medium">{wp.title}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{wp.categories?.name ?? "\u2014"}</TableCell>
              <TableCell><Badge variant="success">{wp.downloads_count.toLocaleString()}</Badge></TableCell>
              <TableCell className="text-muted-foreground">{wp.likes_count.toLocaleString()}</TableCell>
              <TableCell>{wp.is_featured ? <Badge variant="default">Featured</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
              <TableCell>{!wp.is_featured && <Button size="sm" variant="outline" onClick={() => boostToFeatured(wp)}><Star className="h-3 w-3 mr-1" /> Boost</Button>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
