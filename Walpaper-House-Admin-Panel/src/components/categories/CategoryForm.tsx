import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { Category } from "@/types/database";

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSubmit: (data: Partial<Category>) => void;
  isLoading?: boolean;
}

export default function CategoryForm({ open, onOpenChange, category, onSubmit, isLoading }: CategoryFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#a855f7");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    if (category) { setName(category.name); setSlug(category.slug); setIcon(category.icon ?? ""); setColor(category.color ?? "#a855f7"); setDescription(category.description ?? ""); setSortOrder(category.sort_order); }
    else { setName(""); setSlug(""); setIcon(""); setColor("#a855f7"); setDescription(""); setSortOrder(0); }
  }, [category, open]);

  useEffect(() => { if (!category) setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }, [name, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, slug, icon: icon || null, color, description: description || null, sort_order: sortOrder });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{category ? "Edit Category" : "Create Category"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nature" required /></div>
          <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="nature" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Icon (Lucide name)</Label><Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="TreePine" /></div>
            <div className="space-y-2"><Label>Color</Label><div className="flex gap-2"><Input value={color} onChange={(e) => setColor(e.target.value)} /><div className="h-9 w-9 rounded-md border border-border shrink-0" style={{ backgroundColor: color }} /></div></div>
          </div>
          <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nature wallpapers..." /></div>
          <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
