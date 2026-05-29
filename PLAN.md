# Wallpaper-House-2026 — Production Development Plan

> Cross-platform desktop wallpaper application built with Tauri v2, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, and Supabase.

**Target Platforms:** macOS (ARM64 + x64), Windows (x64), Linux (x64 + ARM64)
**Repository:** https://github.com/Rukaiya-Akhter-Zerin/Wallpaper-House-2026
**Supabase Project:** `rfvsnpeafnehgoceavmz` (Tokyo, Northeast Asia)
**Total Development Time:** 20 hours across 10 phases

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Tauri v2 Shell                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React 19 Frontend                       │  │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌─────────────┐  │  │
│  │  │ Dashboard│ │ Gallery  │ │Collections│ │  Analytics   │  │  │
│  │  └─────────┘ └──────────┘ └───────────┘ └─────────────┘  │  │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌─────────────┐  │  │
│  │  │ Search  │ │ Settings │ │   Auth    │ │   Preview    │  │  │
│  │  └─────────┘ └──────────┘ └───────────┘ └─────────────┘  │  │
│  │                                                           │  │
│  │  shadcn/ui │ motion (Framer) │ Zustand │ TanStack Query  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↕ invoke() / events                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Rust Backend (src-tauri)                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │  │
│  │  │wallpaper │ │ display  │ │  cache   │ │  rotation   │  │  │
│  │  │ commands │ │ commands │ │ commands │ │  scheduler   │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────────┘  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │  │
│  │  │   tray   │ │autostart │ │updater   │ │ strongbox   │  │  │
│  │  │  system  │ │  plugin  │ │  plugin  │ │  (secrets)  │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↕ HTTPS                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Supabase Backend                        │  │
│  │  PostgreSQL │ Auth │ Storage │ Edge Functions │ Realtime   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack (Pinned Versions)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Runtime | Tauri | 2.x | Desktop shell, native APIs |
| Language | Rust | 1.95+ | Backend commands, platform integration |
| Frontend | React | 19.x | UI framework |
| Language | TypeScript | 5.7+ | Type safety |
| Bundler | Vite | 6.x | Dev server, build |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Components | shadcn/ui | latest | Accessible component primitives |
| Animation | motion (Framer) | 12.x | Spring physics, gestures, layout |
| State | Zustand | 5.x | Client state management |
| Server State | TanStack Query | 5.x | Async data, caching, sync |
| Database | Supabase | 2.x | Auth, DB, Storage, Edge Functions |
| Grid | react-masonry-css | latest | Pinterest-style masonry layout |
| Charts | Recharts | 2.x | Analytics visualizations |
| Icons | Lucide React | latest | Icon system |
| Fonts | Inter + Geist | latest | Typography |

---

## Tauri v2 Plugins Required

| Plugin | Purpose |
|--------|---------|
| `tauri-plugin-store` | Persistent key-value settings (auto-rotate interval, theme, etc.) |
| `tauri-plugin-stronghold` | Secure credential storage (OAuth tokens, API keys) |
| `tauri-plugin-shell` | Platform wallpaper commands (gsettings, feh on Linux) |
| `tauri-plugin-updater` | Auto-update from GitHub Releases |
| `tauri-plugin-autostart` | Launch at system startup |
| `tauri-plugin-global-shortcut` | Global hotkeys (rotate, toggle UI) |
| `tauri-plugin-notification` | Rotation/update notifications |
| `tauri-plugin-window-state` | Persist window size/position across restarts |
| `tauri-plugin-process` | Relaunch after update |
| `tauri-plugin-single-instance` | Prevent duplicate app instances |
| `tauri-plugin-http` | Supabase API calls from Rust |
| `tauri-plugin-dialog` | File picker for collection imports |
| `tauri-plugin-clipboard-manager` | Copy wallpaper URL to clipboard |
| `tauri-plugin-log` | Structured logging |

---

## Phase Breakdown (20 Hours Total)

### Phase 1 — Project Scaffolding & Core Setup (2.0h)
**Goal:** Working Tauri v2 app with React frontend rendering in a native window.

**Tasks:**
1. Initialize Tauri v2 project with React + TypeScript + Vite template
2. Configure Tailwind CSS v4 with `@tailwindcss/vite` plugin
3. Initialize shadcn/ui with New York style, zinc color palette
4. Set up project directory structure (see below)
5. Configure path aliases (`@/*` → `src/*`)
6. Install and configure all Tauri plugins in `Cargo.toml` and `capabilities/default.json`
7. Set up Supabase client (`@supabase/supabase-js`) with env vars
8. Configure Zustand store with devtools
9. Set up TanStack Query provider
10. Create base app shell with sidebar navigation
11. Initialize GitHub repo, push initial commit
12. Link Supabase project (`supabase link --project-ref rfvsnpeafnehgoceavmz`)

**Deliverable:** Empty app shell running in Tauri window with sidebar, dark mode toggle, Supabase connected.

**Dependencies:** None

---

### Phase 2 — Design System & Motion Infrastructure (2.0h)
**Goal:** Complete design token system, theme provider, animation primitives.

**Tasks:**
1. Define color system: semantic tokens for light/dark modes
   - Backgrounds: `bg-background`, `bg-card`, `bg-muted`, `bg-popover`
   - Foregrounds: `text-foreground`, `text-muted-foreground`, `text-accent`
   - Accents: primary, secondary, destructive, warning, info
   - Glassmorphism: `backdrop-blur-xl bg-white/10 dark:bg-white/5 border-white/20`
2. Typography system: Inter (body), Geist (display/headings)
   - Scale: xs(12) → sm(14) → base(16) → lg(18) → xl(20) → 2xl(24) → 3xl(30) → 4xl(36)
   - Tracking: tight(-0.025em) for headings, normal for body
   - Weights: medium(UI), semibold(headings), bold(hero)
3. Spacing and sizing tokens following 4px grid
4. Build motion primitives module:
   - `springConfig` presets: snappy, bouncy, gentle, stiff
   - `fadeInUp`, `fadeInScale`, `slideInLeft/Right` variants
   - `staggerContainer` with configurable delay
   - `cardHover` with spring physics (scale 1.02, y: -4)
   - `pageTransition` variants
   - `counterAnimation` using `useMotionValue` + `animate()`
5. Create `<MotionProvider>` wrapping `<LazyMotion features={domAnimation}>`
6. Build `<ThemeProvider>` supporting dark/light/system modes
7. Create `useReducedMotion()` integration with motion config
8. Build reusable animation components:
   - `<FadeIn>` — wrapper with configurable direction and delay
   - `<StaggerChildren>` — container that staggers child animations
   - `<AnimatedCounter>` — number counter with spring physics
   - `<ParallaxSection>` — subtle parallax on scroll
9. Set up Tailwind custom theme with CSS variables
10. Create glassmorphism utility classes

**Deliverable:** Design system documented, theme toggle working, animation primitives tested.

**Dependencies:** Phase 1

---

### Phase 3 — Rust Backend Commands (2.5h)
**Goal:** All native platform commands implemented and tested.

**Tasks:**
1. **Wallpaper commands** (`src-tauri/src/commands/wallpaper.rs`):
   - `set_wallpaper(path: String)` — platform-specific:
     - macOS: `NSWorkspace::sharedWorkspace().setDesktopImageURL()` via `cocoa` + `objc` crates (main thread)
     - Windows: `SystemParametersInfoW(SPI_SETDESKWALLPAPER)` via `windows` crate
     - Linux: `gsettings set org.gnome.desktop.background picture-uri` + fallback `feh --bg-fill`
   - `get_current_wallpaper()` — returns current wallpaper path per platform
2. **Display commands** (`src-tauri/src/commands/display.rs`):
   - `get_displays()` — enumerate connected monitors with resolution, position, primary flag
     - macOS: `NSScreen::screens()`
     - Windows: `EnumDisplayDevices` + `EnumDisplaySettings`
     - Linux: `xrandr --query` parsing
   - `set_wallpaper_for_display(path, display_id)` — multi-monitor support
3. **Cache commands** (`src-tauri/src/commands/cache.rs`):
   - `save_to_cache(url: String, data: Vec<u8>)` — download and store locally
   - `read_from_cache(url: String)` → `Option<PathBuf>` — check if cached
   - `get_cache_size()` → `u64` — total cache bytes
   - `clear_cache()` — remove all cached files
   - `get_app_data_dir()` → `PathBuf` — app data directory
4. **Rotation commands** (`src-tauri/src/commands/rotation.rs`):
   - `schedule_rotation(config: RotationConfig)` — start auto-rotate with `tokio::spawn` + interval
   - `cancel_rotation()` — stop rotation
   - `RotationConfig`: interval_secs, mode (sequential/random/category/favorites), category filter
   - State managed via `Arc<Mutex<Option<RotationHandle>>>`
5. **Tray commands** (`src-tauri/src/commands/tray.rs`):
   - System tray setup with `TrayIconBuilder`
   - Menu: Show/Hide, Next Wallpaper, Pause Rotation, Settings, Quit
   - Left-click: show/focus window
   - Close button: minimize to tray instead of quit
6. **Error types** (`src-tauri/src/error.rs`):
   - Custom `Error` enum with `thiserror` derives
   - `serde::Serialize` impl for JS consumption
7. Register all commands in `lib.rs` with `tauri::generate_handler!`
8. Configure capabilities JSON for all plugin permissions
9. Set up `tauri.conf.json`: app metadata, bundle config, updater endpoint, window defaults

**Deliverable:** All Rust commands callable from frontend, wallpaper setting works on current platform.

**Dependencies:** Phase 1

---

### Phase 4 — Supabase Schema & Data Layer (1.5h)
**Goal:** Complete database schema, RLS policies, Edge Functions, seed data.

**Tasks:**
1. **Database migrations** (`supabase/migrations/`):
   ```sql
   -- Core tables
   CREATE TABLE wallpapers (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     title TEXT NOT NULL,
     category_id UUID REFERENCES categories(id),
     tags TEXT[] DEFAULT '{}',
     image_url TEXT NOT NULL,
     thumb_small TEXT NOT NULL,
     thumb_medium TEXT NOT NULL,
     thumb_large TEXT NOT NULL,
     resolution TEXT NOT NULL, -- '4k', '2k', '1080p', 'ultrawide'
     width INT NOT NULL,
     height INT NOT NULL,
     downloads_count INT DEFAULT 0,
     likes_count INT DEFAULT 0,
     author TEXT,
     source TEXT,
     license TEXT,
     colors TEXT[] DEFAULT '{}',
     dominant_color TEXT,
     orientation TEXT NOT NULL, -- 'portrait', 'landscape', 'square'
     file_size_bytes BIGINT DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );

   CREATE TABLE categories (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL UNIQUE,
     slug TEXT NOT NULL UNIQUE,
     icon TEXT,
     color TEXT,
     description TEXT,
     wallpaper_count INT DEFAULT 0,
     sort_order INT DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT now()
   );

   CREATE TABLE favorites (
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     wallpaper_id UUID REFERENCES wallpapers(id) ON DELETE CASCADE,
     created_at TIMESTAMPTZ DEFAULT now(),
     PRIMARY KEY (user_id, wallpaper_id)
   );

   CREATE TABLE collections (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     description TEXT,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     cover_wallpaper_id UUID REFERENCES wallpapers(id),
     is_public BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );

   CREATE TABLE collection_items (
     collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
     wallpaper_id UUID REFERENCES wallpapers(id) ON DELETE CASCADE,
     order_index INT DEFAULT 0,
     added_at TIMESTAMPTZ DEFAULT now(),
     PRIMARY KEY (collection_id, wallpaper_id)
   );

   CREATE TABLE download_log (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     wallpaper_id UUID REFERENCES wallpapers(id) ON DELETE CASCADE,
     user_id UUID REFERENCES auth.users(id),
     downloaded_at TIMESTAMPTZ DEFAULT now(),
     platform TEXT,
     resolution TEXT
   );

   CREATE TABLE usage_stats (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     date DATE NOT NULL DEFAULT CURRENT_DATE,
     wallpapers_viewed INT DEFAULT 0,
     wallpapers_set INT DEFAULT 0,
     wallpapers_downloaded INT DEFAULT 0,
     UNIQUE(user_id, date)
   );

   -- Indexes
   CREATE INDEX idx_wallpapers_category ON wallpapers(category_id);
   CREATE INDEX idx_wallpapers_resolution ON wallpapers(resolution);
   CREATE INDEX idx_wallpapers_orientation ON wallpapers(orientation);
   CREATE INDEX idx_wallpapers_created ON wallpapers(created_at DESC);
   CREATE INDEX idx_wallpapers_downloads ON wallpapers(downloads_count DESC);
   CREATE INDEX idx_favorites_user ON favorites(user_id);
   CREATE INDEX idx_collections_user ON collections(user_id);
   CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
   CREATE INDEX idx_usage_stats_user_date ON usage_stats(user_id, date DESC);
   ```

2. **RLS Policies:**
   - `wallpapers`: public read, authenticated write (admin role)
   - `categories`: public read, authenticated write (admin role)
   - `favorites`: users can CRUD own favorites only
   - `collections`: users can CRUD own collections; public collections readable by all
   - `collection_items`: users can CRUD items in own collections
   - `download_log`: users can insert own logs; read own logs
   - `usage_stats`: users can CRUD own stats

3. **Storage bucket:** `wallpapers` with public access for thumbnails, signed URLs for full-res

4. **Edge Functions** (`supabase/functions/`):
   - `generate-thumbnails`: On upload → create small(300px), medium(600px), large(1200px) WebP
   - `track-popular`: Aggregate downloads by platform/time range, update wallpaper stats
   - `sync-analytics`: Batch sync offline usage data on reconnect

5. **Seed data** (`supabase/seed.sql`):
   - 8 categories with icons and colors
   - 100+ wallpaper entries across all categories with real Unsplash/Pexels URLs
   - Realistic metadata (resolution, dimensions, author, license)

6. **TypeScript types** (`src/types/database.ts`):
   - Auto-generated from Supabase schema via `supabase gen types typescript`

7. **Supabase client** (`src/lib/supabase.ts`):
   - Client initialization with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Typed client with generated types

**Deliverable:** Database schema deployed, RLS enforced, Edge Functions deployed, seed data loaded.

**Dependencies:** Phase 1

---

### Phase 5 — Wallpaper Gallery & Masonry Grid (2.5h)
**Goal:** Browsing wallpapers with Pinterest-style masonry grid, filters, search, preview.

**Tasks:**
1. **Wallpaper store** (`src/stores/wallpaper.ts`):
   - Zustand store: wallpapers[], selectedWallpaper, filters, searchQuery, viewMode
   - Actions: setFilters, setSearch, toggleViewMode, selectWallpaper

2. **TanStack Query hooks** (`src/hooks/useWallpapers.ts`):
   - `useWallpapers(filters)` — paginated fetch with infinite scroll
   - `useWallpaper(id)` — single wallpaper detail
   - `useCategories()` — all categories with counts
   - `useSearchWallpapers(query, filters)` — real-time search with debounce
   - `usePopularWallpapers()` — trending/popular

3. **Masonry grid** (`src/components/wallpaper/WallpaperGrid.tsx`):
   - `react-masonry-css` with responsive breakpoints: 4→3→2→1 columns
   - Variable card heights based on image aspect ratio
   - Staggered reveal: `motion` variants with `staggerChildren: 0.05`
   - Infinite scroll with IntersectionObserver sentinel
   - Loading skeleton with pulse animation
   - Empty state with illustration

4. **Wallpaper card** (`src/components/wallpaper/WallpaperCard.tsx`):
   - Glassmorphism card with rounded-2xl, soft shadow
   - Progressive image loading: blur placeholder → sharp
   - Hover: spring scale(1.02) + y(-4) + shadow increase
   - Overlay on hover: title, resolution badge, heart button, set button
   - Orientation badge (portrait/landscape/square)
   - Click → open preview modal

5. **Preview modal** (`src/components/wallpaper/WallpaperPreview.tsx`):
   - Full-screen modal with backdrop blur
   - Image with zoom (scroll wheel) and pan (drag)
   - Metadata panel: title, category, resolution, author, license, colors
   - Action buttons: Set Wallpaper, Download, Add to Collection, Favorite
   - Keyboard: Escape to close, arrow keys for next/prev
   - Motion: enter with scale(0.95)→1 + fade, exit reverse

6. **Category tabs** (`src/components/wallpaper/CategoryTabs.tsx`):
   - Horizontal scrollable tabs with icons
   - Active indicator: `layoutId` animated underline that glides between tabs
   - "All" + 8 categories
   - Count badge per category

7. **Search bar** (`src/components/wallpaper/SearchBar.tsx`):
   - Input with search icon, debounced 300ms
   - Recent searches dropdown (from store)
   - Filter chips: resolution, orientation, sort order
   - Clear button with spring animation

8. **Filter panel** (`src/components/wallpaper/FilterPanel.tsx`):
   - Resolution: 4K, 2K, 1080p, Ultrawide
   - Orientation: Portrait, Landscape, Square
   - Sort: Popular, Newest, Trending, Most Downloaded
   - Color filter (dominant color swatches)

9. **Set wallpaper action:**
   - One-click: invoke `set_wallpaper` Rust command
   - Download image to cache first, then set from local path
   - Progress indicator during download
   - Success notification with toast

10. **Download action:**
   - Download to user's Downloads folder
   - Progress bar with percentage
   - Track in `download_log` table

**Deliverable:** Full wallpaper browsing experience with masonry grid, search, filters, preview, set/download.

**Dependencies:** Phase 2, Phase 3, Phase 4

---

### Phase 6 — Favorites & Collections (1.5h)
**Goal:** Heart favoriting, custom collections, drag-drop reorder, sync.

**Tasks:**
1. **Favorites system:**
   - Heart toggle on wallpaper cards with spring bounce animation (scale 1→1.3→1)
   - Optimistic update: instant UI toggle, background Supabase sync
   - `useFavorites()` hook: fetch user's favorites, toggle mutation
   - Favorites view: grid of all liked wallpapers
   - Favorites rotation mode: auto-rotate only from liked wallpapers

2. **Collections system:**
   - Create collection: name, description, optional cover image
   - Collection list view: grid of collection cards with cover, name, count
   - Collection detail view: wallpaper grid within collection
   - Add to collection: dropdown/modal to select collection when favoriting
   - Remove from collection with confirmation
   - Rename/delete collection with confirmation dialog
   - Drag-drop reorder within collection (`@dnd-kit/sortable`)
   - Public/private toggle per collection
   - Import/export collections as JSON

3. **Supabase sync:**
   - Favorites table: upsert on toggle, delete on unfavorite
   - Collections table: CRUD operations
   - Collection items: ordered by `order_index`
   - Optimistic updates with rollback on error

4. **UI components:**
   - `<FavoriteButton>` — heart icon with animated fill
   - `<CollectionCard>` — cover image, name, count, actions
   - `<CollectionGrid>` — responsive grid of collections
   - `<AddToCollectionModal>` — select/create collection
   - `<DraggableWallpaperGrid>` — sortable grid within collection

**Deliverable:** Full favorites and collections with sync, drag-drop reorder.

**Dependencies:** Phase 4, Phase 5

---

### Phase 7 — Settings & Preferences (1.0h)
**Goal:** All settings panels with persistent storage.

**Tasks:**
1. **Settings store** (`src/stores/settings.ts`):
   - Persisted via `tauri-plugin-store`
   - Settings: autoRotateInterval, downloadQuality, theme, launchAtStartup, minimizeToTray, notifications, analyticsOptIn

2. **Settings panels:**
   - **Rotation:** interval selector (15m/30m/1h/3h/6h/12h/24h/custom), mode (sequential/random/category/favorites)
   - **Download:** quality selector (original/high/medium/low), storage management (cache size, clear cache button)
   - **Appearance:** theme (dark/light/system), accent color picker
   - **General:** launch at startup toggle, minimize to tray toggle
   - **Shortcuts:** display current global hotkeys (rotate, show/hide)
   - **Notifications:** toggle for rotation events, new wallpapers
   - **About:** app version, check for updates, links

3. **Supabase settings sync:**
   - Sync settings to `user_preferences` table (JSONB column)
   - Background sync on change, debounced 2s
   - Conflict resolution: last-write-wins with timestamp

4. **Storage management:**
   - Display current cache size with progress bar
   - Clear cache button with confirmation
   - Set cache size limit (1GB/5GB/10GB/unlimited)

**Deliverable:** All settings functional, persisted locally and synced to Supabase.

**Dependencies:** Phase 3, Phase 4

---

### Phase 8 — Analytics Dashboard (1.5h)
**Goal:** Usage statistics with animated charts and counters.

**Tasks:**
1. **Analytics store** (`src/stores/analytics.ts`):
   - Stats: totalViewed, totalSet, totalDownloaded, streak days
   - Category breakdown, time-series data

2. **Analytics hooks:**
   - `useUsageStats(period)` — daily/weekly/monthly aggregated stats
   - `usePopularWallpapers(limit)` — most set/downloaded
   - `useCategoryBreakdown()` — distribution per category
   - `useStreak()` — consecutive days counter

3. **Dashboard components:**
   - **Stat cards** (4): Total Viewed, Total Set, Total Downloaded, Current Streak
     - Animated counters with spring physics (`useMotionValue` + `animate()`)
     - Icon + label + value with staggered reveal
     - Trend indicator (up/down arrow with percentage)
   - **Category breakdown:** Donut chart (Recharts `PieChart`) with animated reveal
     - Each segment fills progressively on mount
     - Legend with counts and percentages
     - Click segment → filter gallery to that category
   - **Usage timeline:** Area chart (Recharts `AreaChart`) showing daily activity
     - Smooth line animation on mount
     - Tooltip with exact counts on hover
     - Toggle between viewed/set/downloaded metrics
   - **Popular wallpapers:** Horizontal scroll of top 5 most-set wallpapers
     - Cards with set count badge
     - Click → preview
   - **Streak display:** Calendar heatmap (last 30 days)
     - Color intensity based on activity level
     - Current streak highlighted

4. **Data tracking:**
   - Track `wallpaper_viewed` on preview open
   - Track `wallpaper_set` on set action
   - Track `wallpaper_downloaded` on download
   - Batch sync to Supabase `usage_stats` table
   - Offline: store locally, sync on reconnect

**Deliverable:** Animated analytics dashboard with real usage data.

**Dependencies:** Phase 4, Phase 5

---

### Phase 9 — Auth & Cross-Device Sync (1.5h)
**Goal:** Authentication flow, secure token storage, cross-device sync.

**Tasks:**
1. **Auth flow:**
   - Anonymous auth on first launch (auto-create user)
   - Optional upgrade: email/password, Google OAuth, GitHub OAuth
   - Auth store: user, session, isAuthenticated
   - Auth guard for protected routes (collections, favorites, settings sync)

2. **Supabase Auth integration:**
   - `signInAnonymously()` on first launch
   - `signInWithPassword({ email, password })`
   - `signInWithOAuth({ provider: 'google' | 'github' })` — opens system browser
   - `signOut()` with session cleanup
   - `onAuthStateChange()` listener for session management

3. **Secure token storage:**
   - Store Supabase JWT in `tauri-plugin-stronghold` (encrypted vault)
   - Auto-refresh token before expiry
   - Fallback to `tauri-plugin-store` if stronghold unavailable

4. **Cross-device sync:**
   - Sync favorites, collections, settings to Supabase on login
   - Background sync every 5 minutes when authenticated
   - Conflict resolution: server-timestamp wins with merge for collections
   - Sync status indicator in UI (synced/syncing/offline/error)
   - Offline queue: store mutations locally, replay on reconnect

5. **Auth UI:**
   - Login modal/panel with email/password fields
   - OAuth buttons (Google, GitHub) with brand colors
   - Profile dropdown: avatar, email, sign out
   - Anonymous user banner: "Sign in to sync across devices"

**Deliverable:** Auth flow working, tokens secured, cross-device sync operational.

**Dependencies:** Phase 4

---

### Phase 10 — CI/CD, Polish & Release (2.5h)
**Goal:** Production builds for all platforms, code signing, final polish.

**Tasks:**
1. **GitHub Actions CI** (`.github/workflows/ci.yml`):
   - Trigger: PR to main
   - Jobs: lint (ESLint + Prettier), type-check (tsc --noEmit), test (Vitest)
   - Rust: `cargo check`, `cargo clippy`, `cargo test`
   - Cache: node_modules, cargo registry, target/

2. **GitHub Actions Release** (`.github/workflows/release.yml`):
   - Trigger: tag push `v*`
   - Matrix: macOS (ARM64 + x64), Windows (x64), Linux (x64 + ARM64)
   - Uses `tauri-apps/tauri-action@v0`
   - macOS: DMG, code sign with Apple Developer ID, notarize with `xcrun notarytool`
   - Windows: EXE + MSI, code sign with certificate
   - Linux: AppImage + DEB + RPM
   - Upload all artifacts to GitHub Releases as draft
   - Generate updater JSON (`latest.json`) for auto-update
   - Auto-generate release notes from commits

3. **Environment secrets:**
   - `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`
   - `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`
   - `WINDOWS_CERTIFICATE`, `WINDOWS_CERTIFICATE_PASSWORD`
   - `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

4. **Auto-update:**
   - Configure `tauri-plugin-updater` with GitHub Releases endpoint
   - Check for updates on launch (background)
   - Notification: "Update available — v{version}" with Download button
   - Download and install with progress indicator
   - Relaunch after update

5. **Final polish:**
   - Accessibility audit: ARIA labels, keyboard navigation, focus management
   - `prefers-reduced-motion` support: disable animations, instant transitions
   - Performance audit: 60fps scroll, lazy image loading, virtual list for 1000+ items
   - Error boundaries: catch and display graceful error states
   - Loading states: skeleton screens for all async operations
   - Empty states: illustrations for no results, no favorites, no collections
   - Keyboard shortcuts: Escape (close modal), Arrow keys (navigate), Space (preview)
   - Window state persistence: size, position, maximized state
   - Tray behavior: close minimizes to tray, quit from tray menu
   - App icon: .icns (macOS), .ico (Windows), .png (Linux) — all resolutions

6. **Documentation:**
   - README.md with install instructions, screenshots, features
   - CONTRIBUTING.md with dev setup guide
   - LICENSE (MIT)

**Deliverable:** Production builds on all platforms, code signed, auto-update working, shippable.

**Dependencies:** All previous phases

---

## Project Directory Structure

```
Wallpaper-House-2026/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, type-check, test on PR
│       └── release.yml               # Multi-platform build + release on tag
├── src/                              # React frontend
│   ├── main.tsx                      # App entry point
│   ├── App.tsx                       # Root component with providers
│   ├── index.css                     # Tailwind v4 imports + custom theme
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   └── badge.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx          # Main layout with sidebar
│   │   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   │   ├── TitleBar.tsx          # Custom titlebar (macOS traffic lights)
│   │   │   └── StatusBar.tsx         # Bottom status bar (sync status)
│   │   ├── wallpaper/
│   │   │   ├── WallpaperGrid.tsx     # Masonry grid with infinite scroll
│   │   │   ├── WallpaperCard.tsx     # Individual card with hover effects
│   │   │   ├── WallpaperPreview.tsx  # Full-screen preview modal
│   │   │   ├── CategoryTabs.tsx      # Animated category filter tabs
│   │   │   ├── SearchBar.tsx         # Search with debounce + filters
│   │   │   ├── FilterPanel.tsx       # Resolution/orientation/sort filters
│   │   │   └── SetWallpaperButton.tsx # One-click set with progress
│   │   ├── favorites/
│   │   │   ├── FavoriteButton.tsx    # Heart toggle with bounce
│   │   │   └── FavoritesView.tsx     # Favorites gallery view
│   │   ├── collections/
│   │   │   ├── CollectionCard.tsx    # Collection preview card
│   │   │   ├── CollectionGrid.tsx    # Grid of collections
│   │   │   ├── CollectionDetail.tsx  # Single collection view
│   │   │   └── AddToCollectionModal.tsx
│   │   ├── analytics/
│   │   │   ├── AnalyticsDashboard.tsx # Main analytics view
│   │   │   ├── StatCard.tsx          # Animated counter card
│   │   │   ├── CategoryChart.tsx     # Donut chart
│   │   │   ├── UsageTimeline.tsx     # Area chart
│   │   │   └── StreakCalendar.tsx    # Activity heatmap
│   │   ├── settings/
│   │   │   ├── SettingsView.tsx      # Settings page with tabs
│   │   │   ├── RotationSettings.tsx  # Auto-rotate config
│   │   │   ├── DownloadSettings.tsx  # Quality + storage
│   │   │   ├── AppearanceSettings.tsx # Theme + accent
│   │   │   └── AccountSettings.tsx   # Auth + profile
│   │   ├── auth/
│   │   │   ├── AuthModal.tsx         # Login/signup modal
│   │   │   └── UserMenu.tsx          # Profile dropdown
│   │   └── motion/
│   │       ├── FadeIn.tsx            # Reusable fade-in wrapper
│   │       ├── StaggerChildren.tsx   # Staggered children container
│   │       ├── AnimatedCounter.tsx   # Number counter animation
│   │       ├── ParallaxSection.tsx   # Scroll parallax
│   │       └── PageTransition.tsx    # Route transition wrapper
│   ├── hooks/
│   │   ├── useWallpapers.ts          # Wallpaper CRUD queries
│   │   ├── useFavorites.ts           # Favorites toggle + list
│   │   ├── useCollections.ts         # Collection CRUD
│   │   ├── useCategories.ts          # Category list
│   │   ├── useSearch.ts              # Search with debounce
│   │   ├── useAnalytics.ts           # Usage stats queries
│   │   ├── useAuth.ts                # Auth state + actions
│   │   ├── useSettings.ts            # Settings read/write
│   │   ├── useRotation.ts            # Rotation control
│   │   ├── useSync.ts                # Background sync
│   │   └── useTauriCommand.ts        # Generic invoke wrapper
│   ├── stores/
│   │   ├── wallpaper.ts              # Wallpaper UI state
│   │   ├── settings.ts               # App settings
│   │   ├── analytics.ts              # Analytics cache
│   │   └── auth.ts                   # Auth state
│   ├── lib/
│   │   ├── supabase.ts               # Supabase client
│   │   ├── tauri.ts                   # Tauri command wrappers
│   │   ├── motion.ts                 # Animation presets
│   │   └── utils.ts                  # General utilities
│   ├── types/
│   │   ├── database.ts               # Supabase generated types
│   │   ├── wallpaper.ts              # Wallpaper domain types
│   │   └── settings.ts               # Settings types
│   └── styles/
│       └── glassmorphism.css         # Glassmorphism utilities
├── src-tauri/
│   ├── src/
│   │   ├── main.rs                   # Entry point
│   │   ├── lib.rs                    # Tauri builder + plugin init + command registration
│   │   ├── commands/
│   │   │   ├── wallpaper.rs          # set_wallpaper, get_current_wallpaper
│   │   │   ├── display.rs            # get_displays, set_wallpaper_for_display
│   │   │   ├── cache.rs              # save_to_cache, read_from_cache, get_cache_size, clear_cache
│   │   │   ├── rotation.rs           # schedule_rotation, cancel_rotation
│   │   │   └── tray.rs               # System tray setup
│   │   └── error.rs                  # Custom error types
│   ├── capabilities/
│   │   └── default.json              # Plugin permissions
│   ├── icons/
│   │   ├── icon.icns                 # macOS
│   │   ├── icon.ico                  # Windows
│   │   ├── 32x32.png
│   │   ├── 128x128.png
│   │   ├── 128x128@2x.png
│   │   └── icon.png                  # Linux
│   ├── Cargo.toml
│   ├── tauri.conf.json               # App config, bundle, updater
│   └── build.rs
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_tables.sql
│   │   ├── 002_create_indexes.sql
│   │   ├── 003_create_rls_policies.sql
│   │   ├── 004_create_storage_bucket.sql
│   │   └── 005_create_functions.sql
│   ├── functions/
│   │   ├── generate-thumbnails/
│   │   │   └── index.ts
│   │   ├── track-popular/
│   │   │   └── index.ts
│   │   └── sync-analytics/
│   │       └── index.ts
│   ├── seed.sql                      # 100+ wallpapers + 8 categories
│   └── config.toml
├── public/
│   └── fonts/                        # Self-hosted Inter + Geist
├── .env.example                      # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── components.json                   # shadcn/ui config
├── index.html
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── PLAN.md                           # This file
```

---

## Dependency Graph

```
Phase 1 (Scaffolding)
├── Phase 2 (Design System)
├── Phase 3 (Rust Backend)
├── Phase 4 (Supabase Schema)
│
Phase 5 (Gallery & Grid) ← Phase 2 + 3 + 4
├── Phase 6 (Favorites & Collections) ← Phase 4 + 5
├── Phase 7 (Settings) ← Phase 3 + 4
├── Phase 8 (Analytics) ← Phase 4 + 5
├── Phase 9 (Auth & Sync) ← Phase 4
│
Phase 10 (CI/CD & Release) ← All phases
```

**Parallel execution opportunities:**
- Phases 2, 3, 4 can run in parallel after Phase 1
- Phases 6, 7, 8, 9 can run in parallel after Phase 5
- Phase 10 needs all phases complete

---

## Quality Gates

Each phase must pass before proceeding:

| Phase | Quality Gate |
|-------|-------------|
| 1 | App renders in Tauri window, sidebar works, Supabase connected |
| 2 | Theme toggle works, all motion primitives render correctly |
| 3 | `set_wallpaper` works on current platform, all commands return data |
| 4 | All tables created, RLS enforced, Edge Functions deploy, seed data loads |
| 5 | Masonry grid renders 100+ wallpapers, search/filter work, preview opens |
| 6 | Favorites toggle persists, collections CRUD works, drag-drop reorder works |
| 7 | All settings persist across restart, auto-rotate works |
| 8 | Charts render with real data, counters animate, streak tracks correctly |
| 9 | Anonymous auth works, OAuth flow completes, sync recovers after offline |
| 10 | Builds succeed on all 3 platforms, code signed, auto-update works |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| macOS wallpaper API requires main thread | Use `app.run_on_main_thread()` for NSWorkspace calls |
| Multi-monitor has no Tauri-native API | Platform-specific Rust: NSScreen (macOS), EnumDisplayDevices (Windows), xrandr (Linux) |
| Linux DE fragmentation for wallpaper | Cascade: gsettings (GNOME) → feh (universal) → nitrogen (fallback) |
| Large image gallery performance | Virtual scrolling, lazy loading, WebP thumbnails, aggressive caching |
| Offline-first sync conflicts | Server-timestamp wins, optimistic updates with rollback |
| macOS code signing cost | Requires Apple Developer account ($99/year) — use ad-hoc signing for development |
| Windows code signing cost | Optional — unsigned builds work but trigger SmartScreen warning |

---

## Environment Variables Required

```env
# Supabase (frontend)
VITE_SUPABASE_URL=https://rfvsnpeafnehgoceavmz.supabase.co
VITE_SUPABASE_ANON_KEY=<from-supabase-dashboard>

# macOS Code Signing (CI only)
APPLE_CERTIFICATE=<base64-encoded-p12>
APPLE_CERTIFICATE_PASSWORD=<password>
APPLE_SIGNING_IDENTITY=<Developer ID Application: ...>
APPLE_ID=<apple-id-email>
APPLE_PASSWORD=<app-specific-password>
APPLE_TEAM_ID=<team-id>

# Windows Code Signing (CI only)
WINDOWS_CERTIFICATE=<base64-encoded-pfx>
WINDOWS_CERTIFICATE_PASSWORD=<password>

# Tauri Updater (CI only)
TAURI_SIGNING_PRIVATE_KEY=<signing-key>
TAURI_SIGNING_PRIVATE_KEY_PASSWORD=<password>

# Tavily Search (development)
TAVILY_API_KEY=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
```

---

## Next Steps

1. Execute Phase 1: Scaffold project with `pnpm create tauri-app`
2. Each phase will be executed as a dedicated development session
3. Commit after each phase with descriptive messages
4. Tag release candidates as `v0.1.0-rc.1`, `v0.2.0-rc.1`, etc.
5. Final release: `v1.0.0` with GitHub Release + auto-update
