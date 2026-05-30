import { useState, useCallback } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `wallpapers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      setProgress(30);

      const { error: uploadError } = await supabaseAdmin.storage
        .from("wallpapers")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;

      setProgress(80);

      const { data } = supabaseAdmin.storage.from("wallpapers").getPublicUrl(path);

      setProgress(100);
      return data.publicUrl;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading, progress, error };
}
