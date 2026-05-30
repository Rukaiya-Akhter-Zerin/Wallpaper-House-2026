import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import WallpaperRow from "./WallpaperRow";
import { useSelectionStore } from "@/stores/selectionStore";
import type { Wallpaper } from "@/types/database";

interface WallpaperTableProps {
  wallpapers: (Wallpaper & { categories?: { name: string; slug: string } | null })[];
  isLoading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  allIds: number[];
}

export default function WallpaperTable({ wallpapers, isLoading, onEdit, onDelete, allIds }: WallpaperTableProps) {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const toggleAll = useSelectionStore((s) => s.toggleAll);

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10"><Checkbox checked={allIds.length > 0 && allIds.every((id) => selectedIds.has(id))} onCheckedChange={() => toggleAll(allIds)} /></TableHead>
          <TableHead className="w-20">Image</TableHead><TableHead>Title</TableHead><TableHead>Category</TableHead>
          <TableHead>Resolution</TableHead><TableHead>Downloads</TableHead><TableHead>Likes</TableHead>
          <TableHead className="w-16">Featured</TableHead><TableHead className="w-16">Editors</TableHead>
          <TableHead className="w-16">Active</TableHead><TableHead className="w-20">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {wallpapers.map((wp) => <WallpaperRow key={wp.id} wallpaper={wp} onEdit={onEdit} onDelete={onDelete} />)}
        {wallpapers.length === 0 && <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">No wallpapers found</TableCell></TableRow>}
      </TableBody>
    </Table>
  );
}
