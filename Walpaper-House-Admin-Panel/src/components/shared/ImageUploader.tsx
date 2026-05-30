import { useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { Upload, Link, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState("");
  const [preview, setPreview] = useState(value);
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useImageUpload();

  const handleFileUpload = useCallback(async (file: File) => {
    const url = await upload(file);
    if (url) {
      onChange(url);
      setPreview(url);
    }
  }, [upload, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setPreview(urlInput.trim());
      setUrlInput("");
    }
  };

  const clearImage = () => {
    onChange("");
    setPreview("");
  };

  return (
    <div className="space-y-3">
      <Tabs defaultValue="upload">
        <TabsList className="w-full">
          <TabsTrigger value="upload" className="flex-1"><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload</TabsTrigger>
          <TabsTrigger value="url" className="flex-1"><Link className="h-3.5 w-3.5 mr-1.5" /> From URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="neomorphic-inset flex flex-col items-center justify-center gap-3 p-8 cursor-pointer hover:bg-muted/30 transition-colors"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-accent animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">
              {uploading ? "Uploading..." : "Drag & drop an image or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground/60">JPEG, PNG, WebP up to 20MB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </TabsContent>

        <TabsContent value="url">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            />
            <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>Load</Button>
          </div>
        </TabsContent>
      </Tabs>

      {preview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-lg overflow-hidden border border-border"
        >
          <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
