import { useState } from "react";
import { motion } from "motion/react";

interface WallpaperThumbnailProps {
  src: string;
  alt: string;
  className?: string;
}

export default function WallpaperThumbnail({ src, alt, className = "" }: WallpaperThumbnailProps) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-lg ${className}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        scale: hovered ? 1.05 : 1,
        boxShadow: hovered ? "0 20px 60px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.2)",
      }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{ zIndex: hovered ? 10 : 1 }}
    >
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted rounded-lg" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className="wallpaper-card-img h-full w-full object-cover"
      />
    </motion.div>
  );
}
