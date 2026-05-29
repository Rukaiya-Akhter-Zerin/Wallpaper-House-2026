# Wallpaper-House-2026 — Production Development Plan

> Cross-platform desktop wallpaper app | Tauri v2 + React + TypeScript + Supabase
> Target: macOS, Windows, Linux | 20-hour development window | Production-ready, zero placeholders

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack & Versions](#tech-stack--versions)
- [Infrastructure](#infrastructure)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Development Chunks](#development-chunks)
  - [Chunk 1: Project Foundation & Tauri Setup](#chunk-1-project-foundation--tauri-setup-2h)
  - [Chunk 2: Database Schema & Supabase Integration](#chunk-2-database-schema--supabase-integration-2h)
  - [Chunk 3: Rust Backend Commands](#chunk-3-rust-backend-commands-2h)
  - [Chunk 4: UI Foundation & Theme System](#chunk-4-ui-foundation--theme-system-2h)
  - [Chunk 5: Wallpaper Grid & Masonry Layout](#chunk-5-wallpaper-grid--masonry-layout-2h)
  - [Chunk 6: Search, Filters & Categories](#chunk-6-search-filters--categories-2h)
  - [Chunk 7: Favorites, Collections & Offline](#chunk-7-favorites-collections--offline-2h)
  - [Chunk 8: Settings, Auto-Rotate & System Tray](#chunk-8-settings-auto-rotate--system-tray-2h)
  - [Chunk 9: Analytics Dashboard & Auth](#chunk-9-analytics-dashboard--auth-2h)
  - [Chunk 10: CI/CD, Polish & Release](#chunk-10-cicd-polish--release-2h)
- [File Structure](#file-structure)
- [GitHub Secrets Required](#github-secrets-required)
- [Supabase Environment Variables](#supabase-environment-variables)
- [Acceptance Criteria](#acceptance-criteria)

---

## Project Overview

**Wallpaper-House-2026** is a production-grade cross-platform desktop application for discovering, managing, and setting wallpapers. It features a premium Pinterest/Behance-style masonry dashboard, real-time search and filtering, favorites and collections, auto-rotation with smart scheduling, analytics dashboard, and cross-device sync via Supabase.

**Key Design Principles:**
- Apple/Notion/Linear-level polish — every interaction feels premium
- 60fps GPU-accelerated animations with spring physics
- Offline-first architecture — full functionality without internet
- Production data only — no demo/mock data, seeded from real sources
- Accessibility maintained — reduced-motion support throughout

---

## Tech Stack & Versions

| Layer | Technology | Version |
|-------|-----------|---------|
| Desktop Runtime | Tauri | v2 (2.0.0+) |
| Backend | Rust | 1.95.0 |
| Frontend Framework | React | 19.x |
| Language | TypeScript | 5.x |
| Bundler | Vite | 6.x |
| Styling | Tailwind CSS | v4 (`@tailwindcss/vite`) |
| UI Components | shadcn/ui | latest |
| Animation | Motion (Framer Motion) | latest (`motion/react`) |
| State Management | Zustand | 5.x |
| Masonry Grid | react-masonry-css | latest |
| Backend Service | Supabase | v2 (`@supabase/supabase-js`) |
| Local Database | SQLite (via tauri-plugin-sql) | — |
| Package Manager | pnpm | 9.x |
| Node.js | Node | 22.x |

### Tauri v2 Plugins

| Plugin | Purpose |
|--------|---------|
| `tauri-plugin-store` | Persistent key-value settings |
| `tauri-plugin-stronghold` | Secure credential storage (OAuth tokens, API keys) |
| `tauri-plugin-shell` | Platform wallpaper commands, sidecar execution |
| `tauri-plugin-updater` | Auto-update from GitHub Releases |
| `tauri-plugin-autostart` | Launch at OS startup |
| `tauri-plugin-global-shortcut` | Global hotkeys for rotation control |
| `tauri-plugin-notification` | Rotation/update notifications |
| `tauri-plugin-window-state` | Persist window size/position |
| `tauri-plugin-single-instance` | Prevent duplicate app instances |
| `tauri-plugin-http` | API calls to Supabase from Rust side |
| `tauri-plugin-dialog` | File picker for collection imports |
| `tauri-plugin-clipboard-manage` | Copy wallpaper URL/share |
| `tauri-plugin-sql` | SQLite local cache database |
| `tauri-plugin-process` | Relaunch after update |
| `tauri-plugin-log` | Structured logging |

---

## Infrastructure

| Service | Details |
|---------|---------|
| GitHub Repo | `Rukaiya-Akhter-Zerin/Wallpaper-House-2026` |
| Supabase Project | `rfvsnpeafnehgoceavmz` — Mumbai (ap-south-1) |
| Supabase Org | `juhnchovgqzepjcwsczf` |
| CI/CD | GitHub Actions (macOS, Windows, Linux matrix) |
| Distribution | GitHub Releases (DMG, EXE/MSI, AppImage/DEB/RPM) |
| Auto-Update | Tauri updater + GitHub Releases `latest.json` |

> **IMPORTANT:** The Supabase project `rfvsnpeafnehgoceavmz` was originally created in Tokyo. Supabase does NOT support region migration. You MUST create a NEW project in ap-south-1 (Mumbai) via the Supabase dashboard, then update the project ref throughout this plan. Use `supabase link --project-ref <new-ref>` to connect the CLI. All SQL migrations and seed data will be applied to the new Mumbai project.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │ Dashboard │ │ Settings │ │Analytics │ │  Auth  │  │
│  │  (Grid)   │ │  Panel   │ │  Charts  │ │  Flow  │  │
│  └─────┬────┘ └─────┬────┘ └─────┬────┘ └───┬────┘  │
│        │             │            │           │       │
│  ┌─────┴─────────────┴────────────┴───────────┴────┐  │
│  │              Zustand Store Layer                 │  │
│  │  wallpapers | favorites | collections | settings │  │
│  └─────┬───────────────────────────────────┬───────┘  │
│        │                                   │          │
│  ┌─────┴─────┐                     ┌───────┴───────┐  │
│  │  Supabase  │                     │  Tauri IPC    │  │
│  │  Client    │                     │  invoke()     │  │
│  └─────┬─────┘                     └───────┬───────┘  │
└────────┼───────────────────────────────────┼──────────┘
         │                                   │
┌────────┴──────────┐   ┌────────────┐  ┌────┴──────────┐
│    Supabase       │   │ Unsplash/  │  │ Rust Backend  │
│  (Free Plan)      │   │ Pexels CDN │  │               │
│  ┌──────────────┐ │   │            │  │ ┌───────────┐ │
│  │  PostgreSQL   │ │   │ Image      │  │ │wallpaper  │ │
│  │  (Mumbai)     │ │   │ delivery   │  │ │display    │ │
│  ├──────────────┤ │   │ + resize   │  │ │cache      │ │
│  │  Auth        │ │   │ params     │  │ │rotation   │ │
│  │  (Anon/OAuth)│ │   │            │  │ │tray       │ │
│  ├──────────────┤ │   └────────────┘  │ └───────────┘ │
│  │  Edge Funcs  │ │                   │ ┌───────────┐ │
│  │  (Analytics) │ │                   │ │SQLite     │ │
│  └──────────────┘ │                   │ │(local)    │ │
└───────────────────┘                   │ └───────────┘ │
                                        └───────────────┘
```

> **Supabase Free Plan Strategy:** Images are NOT stored in Supabase Storage. Instead, wallpaper URLs point directly to Unsplash/Pexels CDNs with built-in resize parameters (`?w=400&h=300&fit=crop`). This avoids the free plan's 1GB storage limit and 2GB bandwidth cap. Supabase is used only for: PostgreSQL database (500MB), Auth, and Edge Functions (500K invocations/month). All images are served from external CDNs at zero cost.
>
> **Free Plan Limits:**
> | Resource | Free Tier Limit | Our Usage |
> |----------|----------------|-----------|
> | Database | 500MB | ~50MB for 1000 wallpapers metadata + user data |
> | File Storage | 1GB, 2GB bandwidth | NOT USED — external CDN |
> | Auth | 50K MAU | Anonymous + email + OAuth |
> | Edge Functions | 500K invocations/month | Analytics sync + popular tracking |
> | Realtime | 200 concurrent | Optional: live favorites count |
> | Database Connections | Direct: pooled via Supavisor | Connection string from dashboard |

**Data Flow:**
1. Frontend fetches wallpaper metadata from Supabase DB (paginated, cached locally in SQLite)
2. Images loaded directly from Unsplash/Pexels CDN with resize params for thumbnails
3. Full-resolution images downloaded via Tauri IPC → Rust → local cache before setting as wallpaper
4. Favorites/collections sync bidirectionally: local SQLite ↔ Supabase
5. Offline mutations queued, pushed on reconnect with conflict resolution

---

## Database Schema

### Tables

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,                    -- Lucide icon name
  color text,                   -- Hex color for UI accent
  description text,
  wallpaper_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- WALLPAPERS
-- ============================================
CREATE TABLE wallpapers (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL,
  category_id bigint REFERENCES categories(id),
  tags text[] DEFAULT '{}',
  image_url text NOT NULL,              -- Full resolution Unsplash/Pexels CDN URL
  thumbnail_url_small text,             -- 400px via CDN resize params (?w=400&fit=crop)
  thumbnail_url_medium text,            -- 800px via CDN resize params (?w=800&fit=crop)
  thumbnail_url_large text,             -- 1600px via CDN resize params (?w=1600&fit=crop)
  resolution text NOT NULL,             -- '4K', '2K', '1080p', 'ultrawide'
  width int NOT NULL,
  height int NOT NULL,
  orientation text NOT NULL,            -- 'portrait', 'landscape', 'square'
  downloads_count bigint DEFAULT 0,
  likes_count bigint DEFAULT 0,
  author text,
  source text,                          -- 'unsplash', 'pexels', 'original'
  source_url text,                      -- Original source URL
  license text,                         -- 'free', 'cc0', 'cc-by', 'premium'
  colors jsonb DEFAULT '[]',            -- Array of hex colors
  dominant_color text,                  -- Primary hex color
  file_size_bytes bigint,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_wallpapers_category ON wallpapers(category_id);
CREATE INDEX idx_wallpapers_resolution ON wallpapers(resolution);
CREATE INDEX idx_wallpapers_orientation ON wallpapers(orientation);
CREATE INDEX idx_wallpapers_featured ON wallpapers(is_featured) WHERE is_featured = true;
CREATE INDEX idx_wallpapers_created ON wallpapers(created_at DESC);
CREATE INDEX idx_wallpapers_downloads ON wallpapers(downloads_count DESC);
CREATE INDEX idx_wallpapers_tags ON wallpapers USING GIN(tags);

-- ============================================
-- FAVORITES
-- ============================================
CREATE TABLE favorites (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallpaper_id bigint NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, wallpaper_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ============================================
-- COLLECTIONS
-- ============================================
CREATE TABLE collections (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  cover_url text,                       -- Auto-set from first item
  is_public boolean DEFAULT false,
  wallpaper_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_collections_user ON collections(user_id);

-- ============================================
-- COLLECTION ITEMS
-- ============================================
CREATE TABLE collection_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  collection_id bigint NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  wallpaper_id bigint NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
  order_index int DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  UNIQUE(collection_id, wallpaper_id)
);

CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);

-- ============================================
-- DOWNLOADS LOG
-- ============================================
CREATE TABLE downloads_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wallpaper_id bigint NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  platform text NOT NULL,               -- 'macos', 'windows', 'linux'
  resolution text,
  downloaded_at timestamptz DEFAULT now()
);

CREATE INDEX idx_downloads_wallpaper ON downloads_log(wallpaper_id);
CREATE INDEX idx_downloads_user ON downloads_log(user_id);

-- ============================================
-- USAGE STATS
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

CREATE INDEX idx_usage_user_date ON usage_stats(user_id, date DESC);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wallpapers_updated_at
  BEFORE UPDATE ON wallpapers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### RLS Policies

```sql
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

-- Wallpapers: public read, authenticated insert/update (admin only via service role)
CREATE POLICY "Public read wallpapers" ON wallpapers
  FOR SELECT USING (is_active = true);

-- Favorites: users manage own
CREATE POLICY "Users manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Collections: owner full access, public read if is_public
CREATE POLICY "Owners manage collections" ON collections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read shared collections" ON collections
  FOR SELECT USING (is_public = true);

-- Collection items: follow collection ownership
CREATE POLICY "Owners manage collection items" ON collection_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- Downloads log: insert by authenticated, read own
CREATE POLICY "Users log own downloads" ON downloads_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own downloads" ON downloads_log
  FOR SELECT USING (auth.uid() = user_id);

-- Usage stats: users manage own
CREATE POLICY "Users manage own usage stats" ON usage_stats
  FOR ALL USING (auth.uid() = user_id);
```

### Edge Functions (Free Plan — 500K invocations/month)

| Function | Trigger | Purpose |
|----------|---------|---------|
| `track-popular` | HTTP POST (called by client hourly) | Aggregate downloads, update trending lists |
| `sync-analytics` | HTTP POST | Batch sync offline usage data from clients |
| `curate-featured` | HTTP POST (called by client daily) | Update featured wallpapers based on engagement |

> **Note:** No `generate-thumbnails` needed — Unsplash/Pexels CDN handles image resizing via URL params (`?w=400&h=300&fit=crop&q=80`). Free plan cron triggers are limited; Edge Functions are called by the client on a schedule instead.

---

## Development Chunks

### Chunk 1: Project Foundation & Tauri Setup (2h)

**Goal:** Scaffold complete project, configure all tools, verify dev server runs.

**Tasks:**
1. Initialize Vite + React + TypeScript project with pnpm
2. Install and configure Tailwind CSS v4 (`@tailwindcss/vite` plugin)
3. Initialize shadcn/ui (`pnpm dlx shadcn@latest init`)
4. Install Tauri v2 CLI (`pnpm add -D @tauri-apps/cli@latest`)
5. Initialize Tauri (`pnpm tauri init`) with bundle identifier `com.wallpaper-house.app`
6. Install all Tauri plugins (store, stronghold, shell, updater, autostart, global-shortcut, notification, window-state, single-instance, http, dialog, sql, process, log)
7. Configure `tauri.conf.json` — window size, title, decorations, updater endpoint
8. Configure `capabilities/default.json` with all plugin permissions
9. Install frontend deps: `motion`, `zustand`, `react-masonry-css`, `@supabase/supabase-js`, `lucide-react`, `recharts`, `date-fns`
10. Set up path aliases (`@/*`) in tsconfig.json and tsconfig.app.json
11. Create `.env.example` with all required env vars
12. Create `.gitignore` (Rust target, node_modules, .env, dist)
13. Verify `pnpm tauri dev` launches successfully
14. Initial git commit and push to GitHub

**Deliverable:** Working Tauri dev window with React rendering, all plugins registered.

**Files Created:**
```
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
├── .env.example
├── .gitignore
├── components.json              # shadcn/ui config
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css                # Tailwind v4 imports + @theme
│   └── lib/
│       └── utils.ts             # shadcn cn() utility
├── src-tauri/
│   ├── Cargo.toml               # All plugin dependencies
│   ├── tauri.conf.json          # App config
│   ├── capabilities/
│   │   └── default.json         # Plugin permissions
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs               # Plugin registration
│   └── icons/                   # App icons (all sizes)
└── PLAN.md
```

---

### Chunk 2: Database Schema & Supabase Integration (2h)

**Goal:** Full Supabase setup — schema, RLS, storage, client library, type definitions.

**Tasks:**
1. Link Supabase project (`supabase link --project-ref <mumbai-project-ref>`)
2. Create all migration files (categories, wallpapers, favorites, collections, collection_items, downloads_log, usage_stats)
3. Apply RLS policies for all tables
4. Create `update_updated_at()` trigger function
5. ~~Create Supabase Storage bucket~~ — NOT NEEDED: images served from Unsplash/Pexels CDN directly
6. Create edge function `sync-analytics` (HTTP POST — batch sync offline usage data)
7. Create edge function `track-popular` (HTTP POST — aggregate downloads, update trending)
8. Create edge function `curate-featured` (HTTP POST — update featured wallpapers)
9. Build `src/lib/supabase.ts` — client initialization with env vars
10. Build `src/types/database.ts` — full TypeScript types matching schema
11. Build `src/lib/supabase-queries.ts` — typed query functions (getWallpapers, getCategories, etc.)
12. Seed database with 100 real wallpapers from Unsplash/Pexels CDN (production URLs with resize params, real metadata)
    - `image_url`: full-resolution Unsplash/Pexels URL
    - `thumbnail_url_small`: same URL with `?w=400&fit=crop&q=80`
    - `thumbnail_url_medium`: same URL with `?w=800&fit=crop&q=80`
    - `thumbnail_url_large`: same URL with `?w=1600&fit=crop&q=80`
13. Seed 8 categories with icons and colors
14. Verify all queries work via Supabase dashboard SQL editor

**Deliverable:** Fully configured Supabase (free plan) with schema, RLS, edge functions, and seeded data. No Storage bucket needed — images served from external CDN.

**Files Created:**
```
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 001_create_categories.sql
│   │   ├── 002_create_wallpapers.sql
│   │   ├── 003_create_favorites.sql
│   │   ├── 004_create_collections.sql
│   │   ├── 005_create_collection_items.sql
│   │   ├── 006_create_downloads_log.sql
│   │   ├── 007_create_usage_stats.sql
│   │   ├── 008_create_rls_policies.sql
│   │   ├── 009_create_triggers.sql
│   │   └── 010_create_indexes.sql
│   ├── functions/
│   │   ├── sync-analytics/index.ts
│   │   ├── track-popular/index.ts
│   │   └── curate-featured/index.ts
│   └── seed.sql
├── src/
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── supabase-queries.ts
│   └── types/
│       └── database.ts
```

---

### Chunk 3: Rust Backend Commands (2h)

**Goal:** All Tauri commands implemented — wallpaper setting, display detection, cache, rotation.

**Tasks:**
1. **`wallpaper.rs`** — Platform-specific wallpaper setting:
   - macOS: `cocoa` + `objc` crates → `NSWorkspace::sharedWorkspace().setDesktopImageURL()` (main thread)
   - Windows: `windows` crate → `SystemParametersInfoW(SPI_SETDESKWALLPAPER, ...)`
   - Linux: `std::process::Command` → `gsettings` (GNOME), `feh` (fallback), `nitrogen` (fallback)
   - `get_current_wallpaper()` — platform detection of current wallpaper path
2. **`display.rs`** — Multi-monitor support:
   - macOS: `NSScreen::screens()` enumeration
   - Windows: `EnumDisplayDevices` API
   - Linux: `xrandr` parsing
   - `get_displays()` → `Vec<Display>` with id, name, resolution, is_primary
   - `set_wallpaper_for_display(path, display_id)` — per-monitor wallpaper
3. **`cache.rs`** — Local storage management:
   - `save_to_cache(url, data)` → app data directory
   - `read_from_cache(url)` → cached file path or null
   - `get_cache_size()` → total bytes used
   - `clear_cache(max_age_days)` → remove old files
   - `get_downloads_dir()` → OS-specific downloads path
4. **`rotation.rs`** — Auto-rotate scheduler:
   - `schedule_rotation(config)` — start tokio interval with rotation settings
   - `cancel_rotation()` — stop active scheduler
   - `get_rotation_status()` → current state, next rotation time
   - Support: interval-based, time-of-day (morning/afternoon/evening/night), category-based, favorites-only
   - State managed via `Arc<Mutex<Option<RotationHandle>>>`
5. **`tray.rs`** — System tray:
   - `setup_tray()` — TrayIconBuilder with menu (Show, Pause Rotation, Next Wallpaper, Settings, Quit)
   - Left-click: show/focus window
   - Right-click: context menu
   - Minimize to tray on window close (configurable)
6. **`error.rs`** — Custom error type with serde serialization
7. Register all commands in `lib.rs` invoke handler
8. Test each command via frontend `invoke()` calls

**Deliverable:** All Rust commands working — can set wallpaper, detect displays, manage cache, schedule rotation, handle tray.

**Files Created:**
```
├── src-tauri/
│   ├── Cargo.toml               # Updated with platform deps
│   └── src/
│       ├── lib.rs               # Updated with all command registrations
│       ├── commands/
│       │   ├── mod.rs
│       │   ├── wallpaper.rs     # set_wallpaper, get_current_wallpaper
│       │   ├── display.rs       # get_displays, set_wallpaper_for_display
│       │   ├── cache.rs         # save_to_cache, read_from_cache, get_cache_size, clear_cache
│       │   ├── rotation.rs      # schedule_rotation, cancel_rotation, get_rotation_status
│       │   └── tray.rs          # setup_tray, minimize_to_tray, show_window
│       └── error.rs             # AppError enum with thiserror
```

---

### Chunk 4: UI Foundation & Theme System (2h)

**Goal:** App shell, sidebar, theme system, glassmorphism, typography — the visual foundation.

**Tasks:**
1. **App Shell** (`App.tsx`) — layout with sidebar + main content area
2. **Sidebar** — navigation with icon + label, active indicator with `layoutId` glide animation
   - Dashboard, Categories, Collections, Favorites, Analytics, Settings
   - Collapse/expand with smooth width transition
3. **Theme System** — dark/light mode with `class` strategy on `<html>`:
   - `useTheme` hook with localStorage persistence
   - System preference detection via `prefers-color-scheme`
   - Smooth color transitions (CSS transitions on `background-color`, `color`, `border-color`)
4. **Tailwind v4 Theme Config** (`src/index.css`):
   ```css
   @import "tailwindcss";
   @theme {
     --font-sans: "Inter", system-ui, sans-serif;
     --color-background: var(--bg);
     --color-foreground: var(--fg);
     --color-card: var(--card);
     --color-card-foreground: var(--card-fg);
     --color-muted: var(--muted);
     --color-accent: var(--accent);
     --color-accent-foreground: var(--accent-fg);
     /* Glassmorphism tokens */
     --color-glass: var(--glass);
     --color-glass-border: var(--glass-border);
   }
   ```
5. **Glassmorphism Utility Classes** — `backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20`
6. **Typography Setup** — Inter font via `@fontsource/inter`, heading/body hierarchy
7. **MotionConfig** — global animation config with reduced-motion detection
8. **AnimatePresence** — page transition wrapper
9. **Install shadcn/ui components**: Button, Card, Input, Badge, Avatar, ScrollArea, Sheet, Dialog, DropdownMenu, Tabs, Tooltip, Separator, Skeleton
10. **Custom WallpaperCard** base component (for reuse in grid)
11. **Titlebar** — custom draggable titlebar with window controls (minimize, maximize, close) using `data-tauri-drag-region`

**Deliverable:** App shell with sidebar, dark/light mode, glassmorphism cards, premium typography, custom titlebar.

**Files Created:**
```
├── src/
│   ├── App.tsx                  # App shell with router + sidebar
│   ├── index.css                # Tailwind v4 theme + glassmorphism
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (auto-generated)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Titlebar.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   └── AppLayout.tsx
│   │   └── wallpaper/
│   │       └── WallpaperCard.tsx # Base card component
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   └── useReducedMotion.ts
│   └── stores/
│       └── appStore.ts          # Global app state (sidebar, theme)
```

---

### Chunk 5: Wallpaper Grid & Masonry Layout (2h)

**Goal:** Pinterest-style masonry grid with spring animations, hover effects, preview modal.

**Tasks:**
1. **MasonryGrid** component using `react-masonry-css`:
   - Responsive breakpoints: 4 cols (1440px+), 3 (1024px), 2 (768px), 1 (mobile)
   - Variable card heights based on image aspect ratio
   - Gap: 16px consistent spacing
2. **WallpaperCard** enhanced:
   - Image with progressive loading (blur placeholder → sharp)
   - Lazy loading via `IntersectionObserver`
   - Aspect ratio maintained from `width`/`height` metadata
   - Glassmorphism overlay on hover with title, resolution badge, action buttons
   - `whileHover={{ scale: 1.02, y: -4 }}` with spring `{ stiffness: 300, damping: 20 }`
   - `whileTap={{ scale: 0.98 }}` press state
   - Resolution badge (4K, 2K, 1080p)
   - Favorite heart button with spring bounce animation
   - "Set as wallpaper" quick action button
   - Download button with progress indicator
3. **Staggered Reveal Animation**:
   - Container variant: `{ show: { transition: { staggerChildren: 0.06 } } }`
   - Item variant: `{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } } }`
   - `whileInView` trigger for scroll-based reveals
4. **WallpaperPreviewModal**:
   - Full-screen modal with `AnimatePresence`
   - Image zoom (scroll wheel) + pan (drag)
   - Metadata panel (title, author, resolution, tags, colors)
   - Action buttons: Set Wallpaper, Download, Favorite, Add to Collection
   - Keyboard navigation (Esc to close, arrow keys for next/prev)
   - Parallax background blur effect
5. **Infinite Scroll** — load more wallpapers on scroll with intersection observer
6. **Image Optimization** — Unsplash CDN resize params (`?w=400&fit=crop&q=80`), Pexels CDN params (`?w=400&h=300&fit=crop`). No Supabase Storage needed.

**Deliverable:** Beautiful masonry grid with spring animations, hover effects, preview modal, infinite scroll.

**Files Created:**
```
├── src/
│   ├── components/
│   │   ├── wallpaper/
│   │   │   ├── MasonryGrid.tsx
│   │   │   ├── WallpaperCard.tsx    # Enhanced with hover + actions
│   │   │   ├── WallpaperPreview.tsx # Full-screen modal
│   │   │   ├── WallpaperActions.tsx # Set, Download, Favorite buttons
│   │   │   └── ImageLoader.tsx      # Progressive image loading
│   │   └── ui/
│   │       └── AnimatedCounter.tsx  # Reusable animated number
│   ├── hooks/
│   │   ├── useWallpapers.ts        # Fetch + cache wallpapers
│   │   ├── useInfiniteScroll.ts
│   │   └── useImageLoader.ts
│   └── pages/
│       └── Dashboard.tsx           # Main wallpaper grid page
```

---

### Chunk 6: Search, Filters & Categories (2h)

**Goal:** Real-time search, category system, filter/sort controls with smooth animations.

**Tasks:**
1. **SearchBar** component:
   - Debounced input (300ms) via `useDeferredValue` or custom debounce hook
   - Search icon with animated expand on focus
   - Clear button with spring rotation animation
   - Search history stored in localStorage, displayed as suggestions
   - Keyboard shortcut: `Cmd/Ctrl+K` global shortcut
2. **CategoryTabs**:
   - Horizontal scrollable tab bar with icons
   - Active indicator pill with `layoutId` smooth glide animation
   - Categories: Nature, Abstract, Minimal, Dark, Anime, Architecture, Space, Animals
   - Staggered tab reveal on mount
3. **FilterPanel** (collapsible sidebar or dropdown):
   - Resolution filter: 4K, 2K, 1080p, Ultrawide, Dual Monitor (multi-select badges)
   - Orientation filter: Portrait, Landscape, Square
   - Color filter: Dominant color picker (hex-based grid)
   - Sort: Popular, Newest, Trending, Most Downloaded
   - Clear all filters button
4. **CategoryPage**:
   - Category header with icon, name, description, wallpaper count
   - Category-specific accent color from database
   - Filtered masonry grid
5. **Search Results Page**:
   - Result count with animated counter
   - "No results" state with illustration
   - Search suggestions based on partial matches
6. **State Management**:
   - `useSearchStore` (Zustand) — query, filters, sort, results
   - Debounced Supabase queries with `ilike` for text search
   - Filter composition: category + resolution + orientation + color + sort

**Deliverable:** Working search with debounce, category tabs with glide indicator, filter panel, sort controls.

**Files Created:**
```
├── src/
│   ├── components/
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchSuggestions.tsx
│   │   │   └── SearchHistory.tsx
│   │   ├── filters/
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── ResolutionFilter.tsx
│   │   │   ├── OrientationFilter.tsx
│   │   │   ├── ColorFilter.tsx
│   │   │   └── SortControl.tsx
│   │   └── categories/
│   │       ├── CategoryTabs.tsx
│   │       └── CategoryPage.tsx
│   ├── hooks/
│   │   ├── useSearch.ts
│   │   ├── useDebounce.ts
│   │   └── useFilters.ts
│   ├── stores/
│   │   ├── searchStore.ts
│   │   └── filterStore.ts
│   └── pages/
│       ├── SearchResults.tsx
│       └── Category.tsx
```

---

### Chunk 7: Favorites, Collections & Offline (2h)

**Goal:** Favorites toggle, collections CRUD, drag-drop reorder, offline-first sync.

**Tasks:**
1. **FavoriteToggle**:
   - Heart icon with spring bounce on toggle (`scale: [1, 1.3, 1]`)
   - Optimistic update — UI updates immediately, sync in background
   - Count badge with animated number transition
2. **Collections Page**:
   - Grid of collection cards (cover image, name, wallpaper count)
   - Create collection dialog (name, description, public/private)
   - Edit collection (inline rename, description update)
   - Delete collection with confirmation dialog
   - Collection detail page with masonry grid of contained wallpapers
3. **Add to Collection**:
   - Dropdown menu on wallpaper card → "Add to Collection"
   - Create new collection option inline
   - Multi-select: add wallpaper to multiple collections
4. **Drag & Drop Reorder**:
   - Reorder wallpapers within collection via drag-and-drop
   - `@dnd-kit/core` + `@dnd-kit/sortable` for accessible DnD
   - Smooth spring animation on position change
   - Persist `order_index` to Supabase
5. **Import/Export Collections**:
   - Export collection as JSON (wallpaper IDs + metadata)
   - Import JSON file via `tauri-plugin-dialog`
   - Validate JSON schema before import
6. **Offline-First Sync**:
   - SQLite local cache via `tauri-plugin-sql`
   - On app start: check `last_synced_at` timestamp
   - Pull delta from Supabase using `updated_at > last_synced_at`
   - Queue local mutations (favorites, collections) when offline
   - Push queued mutations on reconnect
   - Conflict resolution: server wins for metadata, client wins for user actions
   - Network status indicator in UI
7. **Favorites Page**:
   - Masonry grid of favorited wallpapers
   - Filter by category within favorites
   - "Rotate from favorites" toggle

**Deliverable:** Working favorites, collections with drag-drop, offline sync with conflict resolution.

**Files Created:**
```
├── src/
│   ├── components/
│   │   ├── favorites/
│   │   │   └── FavoriteToggle.tsx
│   │   ├── collections/
│   │   │   ├── CollectionCard.tsx
│   │   │   ├── CollectionGrid.tsx
│   │   │   ├── CollectionDetail.tsx
│   │   │   ├── CreateCollectionDialog.tsx
│   │   │   ├── AddToCollectionMenu.tsx
│   │   │   ├── DraggableWallpaperGrid.tsx
│   │   │   └── ImportExportDialog.tsx
│   │   └── ui/
│   │       └── NetworkStatus.tsx
│   ├── hooks/
│   │   ├── useFavorites.ts
│   │   ├── useCollections.ts
│   │   ├── useOfflineSync.ts
│   │   └── useDragDrop.ts
│   ├── stores/
│   │   ├── favoritesStore.ts
│   │   └── collectionsStore.ts
│   ├── lib/
│   │   ├── offline-queue.ts
│   │   └── sync-engine.ts
│   └── pages/
│       ├── Favorites.tsx
│       └── Collections.tsx
```

---

### Chunk 8: Settings, Auto-Rotate & System Tray (2h)

**Goal:** Settings panel, auto-rotate UI, system tray integration, global hotkeys.

**Tasks:**
1. **Settings Page**:
   - Sectioned layout with smooth scroll between sections
   - Each section animates in with staggered reveal
2. **Rotation Settings**:
   - Interval selector: 15min, 30min, 1hr, 3hr, 6hr, 12hr, 24hr, custom
   - Smart rotation mode: time-of-day (morning/afternoon/evening/night)
   - Category-based rotation: select which categories to rotate through
   - Favorites-only rotation toggle
   - Next rotation countdown timer with animated digits
   - Pause/Resume rotation button
3. **Download Settings**:
   - Quality selector: Original (full CDN URL), High (`?q=90&w=3840`), Medium (`?q=80&w=2560`), Low (`?q=70&w=1920`) — via Unsplash/Pexels CDN params
   - Default download location picker
   - Storage management:
     - Current cache size (animated counter)
     - Cache limit slider (1GB, 2GB, 5GB, 10GB, Unlimited)
     - Clear cache button with confirmation
4. **Theme Settings**:
   - Dark / Light / System toggle with smooth transition
   - Preview of current theme
5. **Startup Settings**:
   - Launch at startup toggle (via `tauri-plugin-autostart`)
   - Minimize to tray toggle
   - Start minimized toggle
6. **Keyboard Shortcuts**:
   - Display current shortcuts
   - Global hotkeys via `tauri-plugin-global-shortcut`:
     - `Cmd/Ctrl+Shift+W` → Next wallpaper
     - `Cmd/Ctrl+Shift+R` → Toggle rotation
     - `Cmd/Ctrl+Shift+F` → Toggle favorite
     - `Cmd/Ctrl+K` → Open search
7. **Notification Settings**:
   - New wallpaper notifications toggle
   - Rotation event notifications toggle
   - Notification sound toggle
8. **API Settings**:
   - Supabase URL input (for self-hosted)
   - Supabase anon key input
   - Test connection button
9. **System Tray Integration**:
   - Tray icon with context menu
   - Show/Hide window
   - Pause/Resume rotation
   - Next wallpaper
   - Quick favorites access
   - Quit
10. **Window State Persistence**:
    - Save window size, position, maximized state via `tauri-plugin-window-state`
    - Restore on next launch

**Deliverable:** Full settings panel, auto-rotate with UI controls, system tray, global hotkeys.

**Files Created:**
```
├── src/
│   ├── components/
│   │   ├── settings/
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── RotationSettings.tsx
│   │   │   ├── DownloadSettings.tsx
│   │   │   ├── ThemeSettings.tsx
│   │   │   ├── StartupSettings.tsx
│   │   │   ├── ShortcutSettings.tsx
│   │   │   ├── NotificationSettings.tsx
│   │   │   └── ApiSettings.tsx
│   │   └── rotation/
│   │       ├── RotationTimer.tsx
│   │       └── RotationControls.tsx
│   ├── hooks/
│   │   ├── useRotation.ts
│   │   ├── useSettings.ts
│   │   ├── useGlobalShortcuts.ts
│   │   └── useSystemTray.ts
│   ├── stores/
│   │   └── settingsStore.ts
│   └── pages/
│       └── Settings.tsx
```

---

### Chunk 9: Analytics Dashboard & Auth (2h)

**Goal:** Usage analytics with animated charts, authentication flow, cross-device sync.

**Tasks:**
1. **Analytics Dashboard**:
   - Overview cards with animated counters:
     - Total wallpapers viewed (spring-animated number)
     - Wallpapers set as desktop (spring-animated number)
     - Wallpapers downloaded (spring-animated number)
     - Current streak (consecutive days)
   - Category breakdown: pie/donut chart (`recharts`) with progressive reveal animation
   - Usage timeline: line chart (daily/weekly/monthly toggle) with animated draw-in
   - Popular wallpapers: ranked list with slide-in stagger animation
   - Time range selector: 7d, 30d, 90d, All Time
   - Charts animate in with `whileInView` + staggered delays
2. **Authentication Flow**:
   - **Anonymous auth** — automatic on first launch (`supabase.auth.signInAnonymously()`)
   - **Sign Up** — email/password with form validation
   - **Sign In** — email/password with error handling
   - **OAuth** — Google, Apple, GitHub via `signInWithOAuth()` → system browser
   - **Account linking** — convert anonymous to permanent (email or OAuth)
   - **Auth state management** — `useAuth` hook with Supabase `onAuthStateChange`
   - **Token storage** — JWT in `tauri-plugin-stronghold` (encrypted)
   - **Session restore** — on app start, load tokens from Stronghold, call `setSession()`
3. **Sync After Auth**:
   - On login: push local favorites/collections to Supabase
   - On login: pull remote favorites/collections to local
   - Merge strategy: union for favorites, conflict resolution for collections
   - Background sync indicator
4. **Auth UI**:
   - Login/Signup modal with glassmorphism
   - User avatar + name in sidebar footer
   - Sign out button with confirmation

**Deliverable:** Analytics dashboard with animated charts, working auth (anonymous + email + OAuth), cross-device sync.

**Files Created:**
```
├── src/
│   ├── components/
│   │   ├── analytics/
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── CategoryChart.tsx
│   │   │   ├── UsageTimeline.tsx
│   │   │   ├── PopularWallpapers.tsx
│   │   │   └── StreakCounter.tsx
│   │   ├── auth/
│   │   │   ├── AuthModal.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── OAuthButtons.tsx
│   │   │   └── UserMenu.tsx
│   │   └── ui/
│   │       └── AnimatedNumber.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAnalytics.ts
│   │   └── useSync.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── analyticsStore.ts
│   └── pages/
│       └── Analytics.tsx
```

---

### Chunk 10: CI/CD, Polish & Release (2h)

**Goal:** GitHub Actions workflows, auto-update, final polish, version tag, release build.

**Tasks:**
1. **GitHub Actions — CI** (`.github/workflows/ci.yml`):
   - Trigger: push to any branch, PR to main
   - Matrix: macOS, Windows, Ubuntu
   - Steps: checkout, setup node, setup rust, install deps, lint, type-check, build frontend
   - Cache: `swatinem/rust-cache@v2` + pnpm store cache
2. **GitHub Actions — Release** (`.github/workflows/release.yml`):
   - Trigger: push tag `v*`
   - Matrix build:
     - `macos-latest` (aarch64 + x86_64 universal)
     - `windows-latest` (EXE + MSI)
     - `ubuntu-22.04` (AppImage + DEB + RPM)
   - Linux prereqs: `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`
   - Uses `tauri-apps/tauri-action@v0` with `uploadUpdaterJson: true`
   - Upload artifacts to GitHub Releases as draft
   - Auto-generate release notes from commits
3. **Auto-Updater Config**:
   - Generate signing key pair (`tauri signer generate`)
   - Store private key in GitHub Secrets (`TAURI_SIGNING_PRIVATE_KEY`)
   - Configure `tauri.conf.json` with pubkey + GitHub Releases endpoint
   - Test update flow: bump version → tag → release → app detects update
4. **Code Signing Setup** (documented, not executed — requires certificates):
   - macOS: Apple Developer ID, notarization env vars
   - Windows: OV/EV certificate, `WINDOWS_CERTIFICATE` secret
   - Store docs in `docs/signing.md`
5. **App Icons** — generate all sizes from 1024px source:
   - macOS: `.icns` (512, 256, 128, 32, 16)
   - Windows: `.ico` (256, 128, 48, 32, 16)
   - Linux: `.png` (512, 256, 128)
6. **Final Polish**:
   - Loading skeletons for all data-dependent components
   - Error boundaries with retry buttons
   - Empty states with illustrations (no favorites yet, no collections yet)
   - Keyboard navigation audit (Tab, Enter, Esc, Arrow keys)
   - Reduced-motion audit — all animations respect `useReducedMotion()`
   - Performance audit — verify 60fps with React DevTools Profiler
   - Remove all `console.log` statements
   - Verify all TypeScript strict mode errors resolved
7. **Version Bump & Release**:
   - `package.json` version → `1.0.0`
   - `src-tauri/Cargo.toml` version → `1.0.0`
   - `src-tauri/tauri.conf.json` version → `1.0.0`
   - Git tag `v1.0.0`, push to trigger release build
   - Verify all platform artifacts upload to GitHub Releases
8. **Documentation**:
   - `README.md` — project overview, screenshots, install instructions, dev setup
   - `CONTRIBUTING.md` — development workflow, code style
   - `docs/signing.md` — code signing setup guide

**Deliverable:** Working CI/CD, auto-update, polished UI, tagged release, all platform builds.

**Files Created:**
```
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── docs/
│   └── signing.md
├── README.md
└── CONTRIBUTING.md
```

---

## File Structure (Complete)

```
Wallpaper-House-2026/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── docs/
│   └── signing.md
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── ui/                        # shadcn/ui (20+ components)
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Titlebar.tsx
│   │   │   └── PageTransition.tsx
│   │   ├── wallpaper/
│   │   │   ├── MasonryGrid.tsx
│   │   │   ├── WallpaperCard.tsx
│   │   │   ├── WallpaperPreview.tsx
│   │   │   ├── WallpaperActions.tsx
│   │   │   └── ImageLoader.tsx
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchSuggestions.tsx
│   │   │   └── SearchHistory.tsx
│   │   ├── filters/
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── ResolutionFilter.tsx
│   │   │   ├── OrientationFilter.tsx
│   │   │   ├── ColorFilter.tsx
│   │   │   └── SortControl.tsx
│   │   ├── categories/
│   │   │   ├── CategoryTabs.tsx
│   │   │   └── CategoryPage.tsx
│   │   ├── favorites/
│   │   │   └── FavoriteToggle.tsx
│   │   ├── collections/
│   │   │   ├── CollectionCard.tsx
│   │   │   ├── CollectionGrid.tsx
│   │   │   ├── CollectionDetail.tsx
│   │   │   ├── CreateCollectionDialog.tsx
│   │   │   ├── AddToCollectionMenu.tsx
│   │   │   ├── DraggableWallpaperGrid.tsx
│   │   │   └── ImportExportDialog.tsx
│   │   ├── analytics/
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── CategoryChart.tsx
│   │   │   ├── UsageTimeline.tsx
│   │   │   ├── PopularWallpapers.tsx
│   │   │   └── StreakCounter.tsx
│   │   ├── auth/
│   │   │   ├── AuthModal.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── OAuthButtons.tsx
│   │   │   └── UserMenu.tsx
│   │   ├── settings/
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── RotationSettings.tsx
│   │   │   ├── DownloadSettings.tsx
│   │   │   ├── ThemeSettings.tsx
│   │   │   ├── StartupSettings.tsx
│   │   │   ├── ShortcutSettings.tsx
│   │   │   ├── NotificationSettings.tsx
│   │   │   └── ApiSettings.tsx
│   │   ├── rotation/
│   │   │   ├── RotationTimer.tsx
│   │   │   └── RotationControls.tsx
│   │   └── ui/
│   │       ├── AnimatedCounter.tsx
│   │       ├── AnimatedNumber.tsx
│   │       ├── NetworkStatus.tsx
│   │       └── Skeleton.tsx
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   ├── useReducedMotion.ts
│   │   ├── useWallpapers.ts
│   │   ├── useInfiniteScroll.ts
│   │   ├── useImageLoader.ts
│   │   ├── useSearch.ts
│   │   ├── useDebounce.ts
│   │   ├── useFilters.ts
│   │   ├── useFavorites.ts
│   │   ├── useCollections.ts
│   │   ├── useOfflineSync.ts
│   │   ├── useDragDrop.ts
│   │   ├── useRotation.ts
│   │   ├── useSettings.ts
│   │   ├── useGlobalShortcuts.ts
│   │   ├── useSystemTray.ts
│   │   ├── useAuth.ts
│   │   ├── useAnalytics.ts
│   │   └── useSync.ts
│   ├── stores/
│   │   ├── appStore.ts
│   │   ├── searchStore.ts
│   │   ├── filterStore.ts
│   │   ├── favoritesStore.ts
│   │   ├── collectionsStore.ts
│   │   ├── settingsStore.ts
│   │   ├── authStore.ts
│   │   └── analyticsStore.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── supabase-queries.ts
│   │   ├── utils.ts
│   │   ├── offline-queue.ts
│   │   └── sync-engine.ts
│   ├── types/
│   │   └── database.ts
│   └── pages/
│       ├── Dashboard.tsx
│       ├── Category.tsx
│       ├── SearchResults.tsx
│       ├── Favorites.tsx
│       ├── Collections.tsx
│       ├── Analytics.tsx
│       └── Settings.tsx
├── src-tauri/
│   ├── Cargo.toml
│   ├── Cargo.lock
│   ├── build.rs
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   ├── icons/
│   │   ├── icon.icns
│   │   ├── icon.ico
│   │   ├── icon.png
│   │   ├── 32x32.png
│   │   ├── 128x128.png
│   │   ├── 128x128@2x.png
│   │   └── icon.svg
│   └── src/
│       ├── main.rs
│       ├── lib.rs
│       ├── error.rs
│       └── commands/
│           ├── mod.rs
│           ├── wallpaper.rs
│           ├── display.rs
│           ├── cache.rs
│           ├── rotation.rs
│           └── tray.rs
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 001_create_categories.sql
│   │   ├── 002_create_wallpapers.sql
│   │   ├── 003_create_favorites.sql
│   │   ├── 004_create_collections.sql
│   │   ├── 005_create_collection_items.sql
│   │   ├── 006_create_downloads_log.sql
│   │   ├── 007_create_usage_stats.sql
│   │   ├── 008_create_rls_policies.sql
│   │   ├── 009_create_triggers.sql
│   │   └── 010_create_indexes.sql
│   ├── functions/
│   │   ├── sync-analytics/index.ts
│   │   ├── track-popular/index.ts
│   │   └── curate-featured/index.ts
│   └── seed.sql
├── .env.example
├── .gitignore
├── .npmrc
├── components.json
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
├── PLAN.md
├── README.md
└── CONTRIBUTING.md
```

---

## Ruflo Integration

This project uses **Ruflo MCP tools** for development coordination:

| Tool | Usage |
|------|-------|
| `memory_store` / `memory_search` | Persist project decisions, progress across sessions |
| `task_create` / `task_update` / `task_list` | Track 10-chunk development progress |
| `hooks_session-start` / `hooks_session-end` | Session state persistence |
| `hooks_pre-task` / `hooks_post-task` | Task routing and quality scoring |
| `guidance_recommend` | Agent routing for optimal model selection |
| `swarm_init` | Multi-agent parallel development coordination |

**Ruflo workflow:**
1. Session starts → restore state from AgentDB
2. Each chunk → `hooks_pre-task` for routing → spawn agents → `hooks_post-task` for scoring
3. Progress stored in `wallpaper-house-2026` namespace with vector embeddings
4. Session ends → persist to ReflexionMemory for cross-session learning

---

## Ruflo Integration

This project uses **Ruflo MCP tools** for development coordination:

| Tool | Usage |
|------|-------|
| `memory_store` / `memory_search` | Persist project decisions, progress across sessions |
| `task_create` / `task_update` / `task_list` | Track 10-chunk development progress |
| `hooks_session-start` / `hooks_session-end` | Session state persistence |
| `hooks_pre-task` / `hooks_post-task` | Task routing and quality scoring |
| `guidance_recommend` | Agent routing for optimal model selection |
| `swarm_init` | Multi-agent parallel development coordination |

**Ruflo workflow:**
1. Session starts → restore state from AgentDB
2. Each chunk → `hooks_pre-task` for routing → spawn agents → `hooks_post-task` for scoring
3. Progress stored in `wallpaper-house-2026` namespace with vector embeddings
4. Session ends → persist to ReflexionMemory for cross-session learning

---

## Ruflo Integration

This project uses **Ruflo MCP tools** for development coordination:

| Tool | Usage |
|------|-------|
| `memory_store` / `memory_search` | Persist project decisions, progress across sessions |
| `task_create` / `task_update` / `task_list` | Track 10-chunk development progress |
| `hooks_session-start` / `hooks_session-end` | Session state persistence |
| `hooks_pre-task` / `hooks_post-task` | Task routing and quality scoring |
| `guidance_recommend` | Agent routing for optimal model selection |
| `swarm_init` | Multi-agent parallel development coordination |

**Ruflo workflow:**
1. Session starts → restore state from AgentDB
2. Each chunk → `hooks_pre-task` for routing → spawn agents → `hooks_post-task` for scoring
3. Progress stored in `wallpaper-house-2026` namespace with vector embeddings
4. Session ends → persist to ReflexionMemory for cross-session learning

---

## GitHub Secrets Required

| Secret | Purpose | Required For |
|--------|---------|-------------|
| `GITHUB_TOKEN` | Auto-provided by GitHub | All builds |
| `TAURI_SIGNING_PRIVATE_KEY` | Updater signing key | All builds |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Key password (if set) | All builds |
| `APPLE_CERTIFICATE` | Base64 .p12 certificate | macOS signing |
| `APPLE_CERTIFICATE_PASSWORD` | .p12 export password | macOS signing |
| `APPLE_SIGNING_IDENTITY` | Keychain identity name | macOS signing |
| `APPLE_ID` | Apple ID email | macOS notarization |
| `APPLE_PASSWORD` | App-specific password | macOS notarization |
| `APPLE_TEAM_ID` | Apple Developer Team ID | macOS notarization |
| `WINDOWS_CERTIFICATE` | Base64 .pfx certificate | Windows signing |
| `WINDOWS_CERTIFICATE_PASSWORD` | .pfx export password | Windows signing |
| `VITE_SUPABASE_URL` | Supabase project URL | Build time |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Build time |

---

## Supabase Environment Variables

```env
# .env (local development — never commit)
VITE_SUPABASE_URL=https://rfvsnpeafnehgoceavmz.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Tauri signing (local only)
TAURI_SIGNING_PRIVATE_KEY=<generated-private-key>
TAURI_SIGNING_PRIVATE_KEY_PASSWORD=<password-if-any>
```

---

## Acceptance Criteria

### Must Pass Before Release

- [ ] `pnpm tauri dev` launches on macOS, Windows, Linux without errors
- [ ] `pnpm tauri build` produces DMG (macOS), EXE+MSI (Windows), AppImage+DEB+RPM (Linux)
- [ ] Wallpapers load from Supabase with masonry grid, infinite scroll
- [ ] Search with debounce returns results within 300ms
- [ ] Category tabs with glide indicator work
- [ ] Filter panel (resolution, orientation, color, sort) composes correctly
- [ ] Click "Set Wallpaper" changes actual desktop wallpaper on all 3 platforms
- [ ] Multi-monitor wallpaper setting works (detect displays, set per-monitor)
- [ ] Favorites toggle with spring animation, persists to Supabase
- [ ] Collections CRUD (create, rename, delete) works
- [ ] Drag-drop reorder within collections persists
- [ ] Auto-rotate wallpaper on configurable interval works
- [ ] Time-of-day rotation (morning/afternoon/evening/night) works
- [ ] System tray shows icon, context menu works, minimize-to-tray works
- [ ] Global hotkeys (next wallpaper, toggle rotation, toggle favorite) work
- [ ] Dark/light mode toggle with smooth transition
- [ ] All animations run at 60fps (verified with DevTools Performance tab)
- [ ] `useReducedMotion()` disables all animations when OS setting enabled
- [ ] Anonymous auth works on first launch
- [ ] Email/password signup and login works
- [ ] OAuth (Google, GitHub) opens system browser and completes flow
- [ ] Cross-device sync: favorites and collections merge correctly
- [ ] Offline mode: all features work without internet (SQLite cache)
- [ ] Offline queue: mutations push to Supabase when reconnected
- [ ] Analytics dashboard: animated counters, charts with progressive reveal
- [ ] Settings: all toggles and selectors persist to `tauri-plugin-store`
- [ ] Auto-updater detects new version and prompts to install
- [ ] CI workflow passes on all 3 platforms
- [ ] Release workflow builds and uploads all artifacts to GitHub Releases
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] No console errors in production build
- [ ] App icon displays correctly on all platforms
- [ ] README.md with install instructions and screenshots

---

## Development Timeline

| Chunk | Duration | Cumulative | Dependencies |
|-------|----------|-----------|--------------|
| 1. Project Foundation | 2h | 2h | None |
| 2. Database & Supabase | 2h | 4h | Chunk 1 |
| 3. Rust Backend | 2h | 6h | Chunk 1 |
| 4. UI Foundation | 2h | 8h | Chunk 1 |
| 5. Wallpaper Grid | 2h | 10h | Chunks 2, 3, 4 |
| 6. Search & Filters | 2h | 12h | Chunk 5 |
| 7. Favorites & Offline | 2h | 14h | Chunks 2, 5 |
| 8. Settings & Tray | 2h | 16h | Chunks 3, 4 |
| 9. Analytics & Auth | 2h | 18h | Chunks 2, 4, 7 |
| 10. CI/CD & Release | 2h | 20h | All previous |

> **Note:** Chunks 2, 3, and 4 can be developed in parallel after Chunk 1 completes. Chunks 5-10 have sequential dependencies as shown.

---

*Last updated: 2026-05-29 | Plan version: 1.0.0*
