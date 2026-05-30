import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { WallpaperFilters as WF } from "@/hooks/useAdminWallpapers";
import type { Category } from "@/types/database";

interface WallpaperFiltersProps {
  filters: WF;
  onFiltersChange: (filters: WF) => void;
  categories: Category[];
}

export default function WallpaperFilters({ filters, onFiltersChange, categories }: WallpaperFiltersProps) {
  const update = (key: keyof WF, value: string | number | null) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };
  const categoryOptions = categories.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search wallpapers..." value={filters.search ?? ""} onChange={(e) => update("search", e.target.value)} className="pl-10" />
      </div>
      <Select options={categoryOptions} value={filters.category_id ? String(filters.category_id) : ""} onChange={(e) => update("category_id", e.target.value ? Number(e.target.value) : null)} placeholder="All Categories" />
      <Select options={[{ value: "all", label: "All Status" }, { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} value={filters.status ?? "all"} onChange={(e) => update("status", e.target.value)} />
      <Select options={[{ value: "all", label: "All Featured" }, { value: "featured", label: "Featured" }, { value: "not_featured", label: "Not Featured" }]} value={filters.featured ?? "all"} onChange={(e) => update("featured", e.target.value)} />
      <Select options={[{ value: "all", label: "All Editors' Choice" }, { value: "editors_choice", label: "Editors' Choice" }, { value: "not_editors_choice", label: "Not Editors' Choice" }]} value={filters.editors_choice ?? "all"} onChange={(e) => update("editors_choice", e.target.value)} />
      <Select options={[{ value: "newest", label: "Newest" }, { value: "downloads", label: "Most Downloads" }, { value: "likes", label: "Most Likes" }, { value: "title", label: "Title A-Z" }]} value={filters.sort ?? "newest"} onChange={(e) => update("sort", e.target.value)} />
    </div>
  );
}
