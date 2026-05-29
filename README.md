# Wallpaper House

> A premium cross-platform desktop wallpaper application for discovering, managing, and setting beautiful wallpapers.

Built with **Tauri v2**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Supabase**.

---

## Features

### Gallery & Discovery
- **Masonry Gallery** — Pinterest-style responsive grid with variable card heights, staggered spring animations
- **8 Categories** — Nature, Abstract, Minimal, Dark, Anime, Architecture, Space, Animals
- **Real-time Search** — Debounced search with `Ctrl+K` shortcut and search history
- **Smart Filters** — Filter by resolution (4K/2K/1080p/Ultrawide), orientation, color
- **Sort Options** — Popular, Newest, Trending, Most Downloaded
- **100+ Wallpapers** — Seeded with real Unsplash URLs, no demo data

### Wallpaper Management
- **One-Click Set** — Set any wallpaper as your desktop background
  - macOS: `NSWorkspace setDesktopImageURL`
  - Windows: `SystemParametersInfoW`
  - Linux: `gsettings` / `feh` fallback
- **Auto-Rotate** — Configurable intervals (15min to 24h) with sequential/random/category/favorites modes
- **Multi-Monitor** — Detect displays and set per-monitor wallpapers
- **Download** — Save wallpapers locally with quality options (Original/High/Medium/Low)
- **Offline Cache** — Full functionality without internet via local file cache

### Personalization
- **Favorites** — Heart wallpapers with spring bounce animation, synced across devices
- **Collections** — Create custom playlists with drag-drop reorder, public/private toggle
- **Dark/Light/System Mode** — Elegant theme switching with smooth transitions
- **System Tray** — Minimize to tray with quick-access context menu
- **Keyboard Shortcuts** — `Ctrl+K` search, `Escape` close, arrow keys navigate

### Analytics & Sync
- **Analytics Dashboard** — Track wallpapers viewed, set, downloaded, and daily streaks
- **Category Breakdown** — Visual distribution of your wallpaper preferences
- **Cross-Device Sync** — Favorites, collections, and settings sync via Supabase
- **Anonymous Auth** — Start immediately, optionally sign in for sync
- **OAuth** — Sign in with Google or GitHub

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | **Tauri v2** | Cross-platform desktop shell |
| Backend | **Rust** | Native wallpaper setting, cache, rotation |
| Frontend | **React 19** + **TypeScript** | UI framework |
| Styling | **Tailwind CSS v4** | Utility-first CSS |
| Components | **shadcn/ui** | Accessible component primitives |
| Animation | **Motion** (Framer Motion) | Spring physics, gestures, layout |
| State | **Zustand** | Client state management |
| Server State | **TanStack Query** | Async data, caching, sync |
| Database | **Supabase** | PostgreSQL, Auth, Edge Functions |
| Build | **Vite 8** + **pnpm 9** | Dev server, bundling |

---

## Screenshots

<!-- Add screenshots here -->

```
Coming soon — run `pnpm tauri dev` to see the app
```

---

## Quick Start

### Prerequisites

- **Node.js** 22+
- **Rust** 1.77+
- **pnpm** 9+
- **Supabase CLI** (for database setup)

### Clone & Install

```bash
git clone https://github.com/Rukaiya-Akhter-Zerin/Wallpaper-House-2026.git
cd Wallpaper-House-2026
pnpm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com) (Mumbai region recommended)
2. Link your project:
   ```bash
   supabase link --project-ref <your-ref>
   ```
3. Run migrations:
   ```bash
   supabase db push
   ```
4. Seed data (100+ wallpapers):
   ```bash
   supabase db seed
   ```
5. Deploy Edge Functions:
   ```bash
   supabase functions deploy
   ```

### Start Development

```bash
pnpm tauri dev
```

This starts both the Vite dev server and the Tauri desktop app with hot-reload.

---

## Build

### Frontend Only

```bash
pnpm build
```

### Desktop App (All Platforms)

```bash
pnpm tauri build
```

This produces:
- **macOS**: `.dmg` (ARM64 + x64 universal)
- **Windows**: `.msi` + `.exe`
- **Linux**: `.AppImage`, `.deb`, `.rpm`

---

## Project Structure

```
Wallpaper-House-2026/
├── src/                          # React frontend
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── layout/               # App shell, sidebar, titlebar
│   │   ├── wallpaper/            # Gallery, cards, preview, grid
│   │   ├── search/               # Search bar, suggestions
│   │   ├── filters/              # Filter panel
│   │   ├── categories/           # Category tabs, page
│   │   ├── favorites/            # Favorite toggle
│   │   ├── collections/          # Collection CRUD
│   │   ├── settings/             # Settings panels
│   │   ├── analytics/            # Charts, stats
│   │   └── auth/                 # Auth modal, user menu
│   ├── hooks/                    # Custom React hooks
│   ├── stores/                   # Zustand state stores
│   ├── lib/                      # Supabase client, utilities
│   ├── types/                    # TypeScript types
│   └── pages/                    # Route pages
├── src-tauri/
│   ├── src/
│   │   ├── commands/             # Rust commands (wallpaper, display, cache, rotation, tray)
│   │   ├── error.rs              # Custom error types
│   │   ├── lib.rs                # Plugin registration + command handler
│   │   └── main.rs               # Entry point
│   ├── capabilities/             # Plugin permissions
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # App configuration
├── supabase/
│   ├── migrations/               # SQL schema (7 tables, RLS, triggers)
│   ├── functions/                # Edge Functions (analytics, popular, featured)
│   ├── seed.sql                  # 100+ real wallpapers
│   └── config.toml               # Supabase config
├── .github/workflows/
│   ├── ci.yml                    # Lint + type-check + build
│   └── release.yml               # Multi-platform release builds
└── PLAN.md                       # Development plan (10 chunks)
```

---

## Architecture

### Rust Backend (14 Tauri Plugins)

| Command | Purpose |
|---------|---------|
| `set_wallpaper` | Platform-specific wallpaper setting |
| `get_current_wallpaper` | Detect current wallpaper path |
| `get_displays` | Multi-monitor enumeration |
| `set_wallpaper_for_display` | Per-monitor wallpaper |
| `save_to_cache` / `read_from_cache` | Local file cache |
| `get_cache_size` / `clear_cache` | Cache management |
| `schedule_rotation` / `cancel_rotation` | Auto-rotate scheduler (tokio) |
| `get_rotation_status` | Rotation state query |

### Supabase Schema (7 Tables)

| Table | Purpose |
|-------|---------|
| `categories` | 8 wallpaper categories |
| `wallpapers` | 100+ wallpapers with metadata |
| `favorites` | User favorites (per-user) |
| `collections` | Custom playlists |
| `collection_items` | Wallpapers in collections |
| `downloads_log` | Download tracking |
| `usage_stats` | Daily usage analytics |

### Edge Functions

| Function | Purpose |
|----------|---------|
| `sync-analytics` | Batch sync offline usage data |
| `track-popular` | Aggregate download counts |
| `curate-featured` | Update featured wallpapers |

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Tauri Updater (optional, for auto-update)
TAURI_SIGNING_PRIVATE_KEY=
TAURI_SIGNING_PRIVATE_KEY_PASSWORD=
```

---

## CI/CD

### Continuous Integration (`.github/workflows/ci.yml`)
- Runs on every push and PR
- Frontend: lint, type-check, build
- Rust: `cargo check`, `cargo clippy`

### Release (`.github/workflows/release.yml`)
- Triggered on version tag (`v*`)
- Builds for macOS (ARM64 + x64), Windows, Linux
- Uploads artifacts to GitHub Releases
- Auto-generates updater JSON for auto-update

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Branch naming conventions
- PR process

---

## License

MIT License. See [LICENSE](LICENSE).

---

## Acknowledgments

- [Unsplash](https://unsplash.com) — Free high-resolution photos
- [Tauri](https://tauri.app) — Cross-platform desktop framework
- [shadcn/ui](https://ui.shadcn.com) — Accessible component library
- [Supabase](https://supabase.com) — Open-source Firebase alternative
