-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_wallpapers_category ON wallpapers(category_id);
CREATE INDEX idx_wallpapers_resolution ON wallpapers(resolution);
CREATE INDEX idx_wallpapers_orientation ON wallpapers(orientation);
CREATE INDEX idx_wallpapers_featured ON wallpapers(is_featured) WHERE is_featured = true;
CREATE INDEX idx_wallpapers_active ON wallpapers(is_active) WHERE is_active = true;
CREATE INDEX idx_wallpapers_created ON wallpapers(created_at DESC);
CREATE INDEX idx_wallpapers_downloads ON wallpapers(downloads_count DESC);
CREATE INDEX idx_wallpapers_likes ON wallpapers(likes_count DESC);
CREATE INDEX idx_wallpapers_tags ON wallpapers USING GIN(tags);
CREATE INDEX idx_wallpapers_colors ON wallpapers USING GIN(colors);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_wallpaper ON favorites(wallpaper_id);
CREATE UNIQUE INDEX idx_favorites_user_wallpaper ON favorites(user_id, wallpaper_id);

CREATE INDEX idx_collections_user ON collections(user_id);
CREATE INDEX idx_collections_public ON collections(is_public) WHERE is_public = true;

CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX idx_collection_items_wallpaper ON collection_items(wallpaper_id);

CREATE INDEX idx_downloads_wallpaper ON downloads_log(wallpaper_id);
CREATE INDEX idx_downloads_user ON downloads_log(user_id);
CREATE INDEX idx_downloads_date ON downloads_log(downloaded_at DESC);

CREATE INDEX idx_usage_user_date ON usage_stats(user_id, date DESC);
