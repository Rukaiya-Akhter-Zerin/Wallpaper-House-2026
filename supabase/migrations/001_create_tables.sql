-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  color text,
  description text,
  wallpaper_count int DEFAULT 0,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- WALLPAPERS TABLE
-- ============================================
CREATE TABLE wallpapers (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL,
  category_id bigint REFERENCES categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  image_url text NOT NULL,
  thumbnail_url_small text,
  thumbnail_url_medium text,
  thumbnail_url_large text,
  resolution text NOT NULL,
  width int NOT NULL,
  height int NOT NULL,
  orientation text NOT NULL CHECK (orientation IN ('portrait', 'landscape', 'square')),
  downloads_count bigint DEFAULT 0,
  likes_count bigint DEFAULT 0,
  author text,
  source text,
  source_url text,
  license text,
  colors jsonb DEFAULT '[]',
  dominant_color text,
  file_size_bytes bigint,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE favorites (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallpaper_id bigint NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, wallpaper_id)
);

-- ============================================
-- COLLECTIONS TABLE
-- ============================================
CREATE TABLE collections (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  cover_url text,
  is_public boolean DEFAULT false,
  wallpaper_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- COLLECTION ITEMS TABLE
-- ============================================
CREATE TABLE collection_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  collection_id bigint NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  wallpaper_id bigint NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
  order_index int DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  UNIQUE(collection_id, wallpaper_id)
);

-- ============================================
-- DOWNLOADS LOG TABLE
-- ============================================
CREATE TABLE downloads_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wallpaper_id bigint NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  platform text NOT NULL,
  resolution text,
  downloaded_at timestamptz DEFAULT now()
);

-- ============================================
-- USAGE STATS TABLE
-- ============================================
CREATE TABLE usage_stats (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  wallpapers_viewed int DEFAULT 0,
  wallpapers_set int DEFAULT 0,
  wallpapers_downloaded int DEFAULT 0,
  session_seconds int DEFAULT 0,
  UNIQUE(user_id, date)
);
