-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER wallpapers_updated_at
  BEFORE UPDATE ON wallpapers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update wallpaper count on categories
CREATE OR REPLACE FUNCTION update_category_wallpaper_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories SET wallpaper_count = wallpaper_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories SET wallpaper_count = wallpaper_count - 1 WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id THEN
    IF OLD.category_id IS NOT NULL THEN
      UPDATE categories SET wallpaper_count = wallpaper_count - 1 WHERE id = OLD.category_id;
    END IF;
    IF NEW.category_id IS NOT NULL THEN
      UPDATE categories SET wallpaper_count = wallpaper_count + 1 WHERE id = NEW.category_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER wallpapers_category_count
  AFTER INSERT OR UPDATE OR DELETE ON wallpapers
  FOR EACH ROW EXECUTE FUNCTION update_category_wallpaper_count();

-- Auto-update collection wallpaper count
CREATE OR REPLACE FUNCTION update_collection_wallpaper_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collections SET wallpaper_count = wallpaper_count + 1 WHERE id = NEW.collection_id;
    -- Set cover_url from first wallpaper
    UPDATE collections SET cover_url = (
      SELECT thumbnail_url_small FROM wallpapers WHERE id = NEW.wallpaper_id
    ) WHERE id = NEW.collection_id AND cover_url IS NULL;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collections SET wallpaper_count = wallpaper_count - 1 WHERE id = OLD.collection_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER collection_items_count
  AFTER INSERT OR DELETE ON collection_items
  FOR EACH ROW EXECUTE FUNCTION update_collection_wallpaper_count();

-- Update likes count on wallpapers
CREATE OR REPLACE FUNCTION update_wallpaper_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE wallpapers SET likes_count = likes_count + 1 WHERE id = NEW.wallpaper_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE wallpapers SET likes_count = likes_count - 1 WHERE id = OLD.wallpaper_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER favorites_likes_count
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION update_wallpaper_likes_count();
