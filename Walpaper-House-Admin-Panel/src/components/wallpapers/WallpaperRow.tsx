import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateWallpaper } from "@/hooks/useAdminWallpapers";
import { useSelectionStore } from "@/stores/selectionStore";
import { useToastStore } from "@/stores/toastStore";
import { Pencil, Trash2 } from "lucide-react";
import type { Wallpaper } from "@/types/database";

interface WallpaperRowProps {
  wallpaper: Wallpaper & { categories?: { name: string; slug: string } | null };
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function WallpaperRow({ wallpaper, onEdit, onDelete }: WallpaperRowProps) {
  const updateMutation = useUpdateWallpaper();
  const addToast = useToastStore((s) => s.addToast);
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const toggle = useSelectionStore((s) => s.toggle);

  const toggleField = async (field: "is_featured" | "is_editors_choice" | "is_active", value: boolean) => {
    try {
      await updateMutation.mutateAsync({ id: wallpaper.id, [field]: value });
      addToast(`${field.replace("is_", "").replace("_", " ")} ${value ? "enabled" : "disabled"}`, "success");
    } catch { addToast("Failed to update", "error"); }
  };

  return (
    <TableRow>
      <TableCell><Checkbox checked={selectedIds.has(wallpaper.id)} onCheckedChange={() => toggle(wallpaper.id)} /></TableCell>
      <TableCell><div className="h-12 w-16 overflow-hidden rounded-md bg-muted"><img src={wallpaper.thumbnail_url_small ?? wallpaper.image_url} alt={wallpaper.title} className="h-full w-full object-cover" loading="lazy" /></div></TableCell>
      <TableCell className="font-medium max-w-[200px] truncate">{wallpaper.title}</TableCell>
      <TableCell className="text-muted-foreground">{wallpaper.categories?.name ?? "\u2014"}</TableCell>
      <TableCell className="text-muted-foreground text-xs">{wallpaper.resolution}</TableCell>
      <TableCell className="text-muted-foreground text-xs">{wallpaper.downloads_count.toLocaleString()}</TableCell>
      <TableCell className="text-muted-foreground text-xs">{wallpaper.likes_count.toLocaleString()}</TableCell>
      <TableCell><Switch checked={wallpaper.is_featured} onCheckedChange={(v) => toggleField("is_featured", v)} /></TableCell>
      <TableCell><Switch checked={wallpaper.is_editors_choice} onCheckedChange={(v) => toggleField("is_editors_choice", v)} /></TableCell>
      <TableCell><Switch checked={wallpaper.is_active} onCheckedChange={(v) => toggleField("is_active", v)} /></TableCell>
      <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => onEdit(wallpaper.id)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => onDelete(wallpaper.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
    </TableRow>
  );
}
