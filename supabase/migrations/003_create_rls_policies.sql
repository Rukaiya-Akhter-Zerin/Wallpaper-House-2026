-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- Categories: public read
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (true);

-- Wallpapers: public read for active
CREATE POLICY "Public read active wallpapers" ON wallpapers
  FOR SELECT USING (is_active = true);

-- Favorites: users manage own
CREATE POLICY "Users view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Collections: owner full access, public read if shared
CREATE POLICY "Users view own collections" ON collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public read shared collections" ON collections
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users insert own collections" ON collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own collections" ON collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own collections" ON collections
  FOR DELETE USING (auth.uid() = user_id);

-- Collection items: follow collection ownership
CREATE POLICY "Users view own collection items" ON collection_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM collections WHERE collections.id = collection_items.collection_id AND collections.user_id = auth.uid())
  );

CREATE POLICY "Users manage own collection items" ON collection_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM collections WHERE collections.id = collection_items.collection_id AND collections.user_id = auth.uid())
  );

-- Downloads log: insert by authenticated, read own
CREATE POLICY "Users insert own downloads" ON downloads_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own downloads" ON downloads_log
  FOR SELECT USING (auth.uid() = user_id);

-- Usage stats: users manage own
CREATE POLICY "Users view own usage stats" ON usage_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own usage stats" ON usage_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own usage stats" ON usage_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users upsert own usage stats" ON usage_stats
  FOR DELETE USING (auth.uid() = user_id);
