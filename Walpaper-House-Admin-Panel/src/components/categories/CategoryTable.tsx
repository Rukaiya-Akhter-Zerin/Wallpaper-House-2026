import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import type { Category } from "@/types/database";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

export default function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Icon</TableHead><TableHead>Name</TableHead><TableHead>Slug</TableHead>
          <TableHead>Color</TableHead><TableHead>Wallpapers</TableHead><TableHead>Sort</TableHead><TableHead className="w-24">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((cat) => (
          <TableRow key={cat.id}>
            <TableCell><Badge variant="outline" style={{ borderColor: cat.color ?? undefined }}>{cat.icon ?? "\u2014"}</Badge></TableCell>
            <TableCell className="font-medium">{cat.name}</TableCell>
            <TableCell className="text-muted-foreground text-sm">{cat.slug}</TableCell>
            <TableCell><div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: cat.color ?? "#888" }} /><span className="text-xs text-muted-foreground">{cat.color}</span></div></TableCell>
            <TableCell>{cat.wallpaper_count}</TableCell>
            <TableCell>{cat.sort_order}</TableCell>
            <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => onEdit(cat)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => onDelete(cat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
