import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function CreateCollectionDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string, description: string, isPublic: boolean) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onCreate(name.trim(), description.trim(), isPublic);
    setName(""); setDescription(""); setIsPublic(false);
    setLoading(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold">Create Collection</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2"><Label htmlFor="col-name">Name</Label><Input id="col-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Collection" required /></div>
          <div className="space-y-2"><Label htmlFor="col-desc">Description</Label><Input id="col-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" /></div>
          <div className="flex items-center justify-between"><Label htmlFor="col-public">Make public</Label><Switch id="col-public" checked={isPublic} onCheckedChange={setIsPublic} /></div>
          <div className="flex gap-2 pt-2"><Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button><Button type="submit" className="flex-1" disabled={!name.trim() || loading}>{loading ? "Creating..." : "Create"}</Button></div>
        </form>
      </div>
    </div>
  );
}
