export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          user_id: string;
          role: "admin" | "super_admin";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["admin_users"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
          icon: string | null;
          color: string | null;
          description: string | null;
          wallpaper_count: number;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at" | "wallpaper_count">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      wallpapers: {
        Row: {
          id: number;
          title: string;
          category_id: number | null;
          tags: string[];
          image_url: string;
          thumbnail_url_small: string | null;
          thumbnail_url_medium: string | null;
          thumbnail_url_large: string | null;
          resolution: string;
          width: number;
          height: number;
          orientation: "portrait" | "landscape" | "square";
          downloads_count: number;
          likes_count: number;
          author: string | null;
          source: string | null;
          source_url: string | null;
          license: string | null;
          colors: Json;
          dominant_color: string | null;
          file_size_bytes: number | null;
          is_featured: boolean;
          is_editors_choice: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["wallpapers"]["Row"], "id" | "created_at" | "updated_at" | "downloads_count" | "likes_count" | "is_featured" | "is_editors_choice" | "is_active">;
        Update: Partial<Database["public"]["Tables"]["wallpapers"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "wallpapers_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      favorites: {
        Row: { id: number; user_id: string; wallpaper_id: number; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["favorites"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["favorites"]["Insert"]>;
        Relationships: [];
      };
      collections: {
        Row: { id: number; user_id: string; name: string; description: string | null; cover_url: string | null; is_public: boolean; wallpaper_count: number; created_at: string; updated_at: string };
        Insert: Omit<Database["public"]["Tables"]["collections"]["Row"], "id" | "created_at" | "updated_at" | "wallpaper_count" | "cover_url"> & { cover_url?: string | null };
        Update: Partial<Database["public"]["Tables"]["collections"]["Insert"]>;
        Relationships: [];
      };
      collection_items: {
        Row: { id: number; collection_id: number; wallpaper_id: number; order_index: number; added_at: string };
        Insert: Omit<Database["public"]["Tables"]["collection_items"]["Row"], "id" | "added_at">;
        Update: Partial<Database["public"]["Tables"]["collection_items"]["Insert"]>;
        Relationships: [];
      };
      downloads_log: {
        Row: { id: number; wallpaper_id: number; user_id: string | null; platform: string; resolution: string | null; downloaded_at: string };
        Insert: Omit<Database["public"]["Tables"]["downloads_log"]["Row"], "id" | "downloaded_at">;
        Update: Partial<Database["public"]["Tables"]["downloads_log"]["Insert"]>;
        Relationships: [];
      };
      usage_stats: {
        Row: { id: number; user_id: string; date: string; wallpapers_viewed: number; wallpapers_set: number; wallpapers_downloaded: number; session_seconds: number };
        Insert: Omit<Database["public"]["Tables"]["usage_stats"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["usage_stats"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Wallpaper = Database["public"]["Tables"]["wallpapers"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type Collection = Database["public"]["Tables"]["collections"]["Row"];
export type CollectionItem = Database["public"]["Tables"]["collection_items"]["Row"];
export type UsageStats = Database["public"]["Tables"]["usage_stats"]["Row"];
