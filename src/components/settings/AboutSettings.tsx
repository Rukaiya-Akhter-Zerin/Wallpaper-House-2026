import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function AboutSettings() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm">Version</span>
        <Badge variant="secondary">v0.1.0</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Built with</span>
        <Badge variant="outline">Tauri v2 + React + Supabase</Badge>
      </div>
      <Button variant="outline" size="sm" asChild>
        <a href="https://github.com/Rukaiya-Akhter-Zerin/Wallpaper-House-2026" target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />GitHub Repository
        </a>
      </Button>
    </div>
  );
}
