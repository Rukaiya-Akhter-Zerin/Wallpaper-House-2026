# Wallpaper House

A premium cross-platform desktop wallpaper application for discovering, managing, and setting beautiful wallpapers. Built with Tauri v2, React 19, TypeScript, and Supabase.

## Features

- **Masonry Gallery** — Pinterest-style responsive grid with variable card heights and staggered animations
- **8 Categories** — Nature, Abstract, Minimal, Dark, Anime, Architecture, Space, Animals
- **Real-time Search** — Debounced search with keyboard shortcut (Ctrl+K) and search history
- **Smart Filters** — Filter by resolution (4K/2K/1080p), orientation, and sort by popularity/newest/trending
- **Favorites** — Heart wallpapers with spring bounce animation, synced across devices
- **Collections** — Create custom playlists of wallpapers with drag-drop reorder
- **One-Click Set** — Set any wallpaper as your desktop background (macOS, Windows, Linux)
- **Auto-Rotate** — Configurable rotation intervals with sequential/random/category/favorites modes
- **Analytics Dashboard** — Track usage stats, popular categories, and daily streaks
- **Cross-Device Sync** — Favorites, collections, and settings sync via Supabase
- **Offline-First** — Full functionality without internet via local SQLite cache
- **System Tray** — Minimize to tray with quick-access context menu
- **Dark/Light Mode** — Elegant theme switching with system preference detection
- **60fps Animations** — GPU-accelerated spring physics via Framer Motion

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Tauri v2 |
| Frontend | React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Animation | Motion (Framer Motion) |
| State | Zustand |
| Data | Supabase (PostgreSQL, Auth, Edge Functions) |
| Backend | Rust |
| Build | Vite 8, pnpm 9 |

## Installation

### Download

Download the latest release for your platform from [GitHub Releases](https://github.com/Rukaiya-Akhter-Zerin/Wallpaper-House-2026/releases):

- **macOS**: `.dmg` (ARM64 + x64)
- **Windows**: `.msi` or `.exe`
- **Linux**: `.AppImage`, `.deb`, or `.rpm`

### Development Setup

**Prerequisites**: Node.js 22+, Rust 1.77+, pnpm 9+

```bash
# Clone the repository
git clone https://github.com/Rukaiya-Akhter-Zerin/Wallpaper-House-2026.git
cd Wallpaper-House-2026

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
pnpm tauri dev
```

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Link your project: `supabase link --project-ref <your-ref>`
3. Run migrations: `supabase db push`
4. Seed data: `supabase db seed`
5. Deploy Edge Functions: `supabase functions deploy`

### Build from Source

```bash
# Build frontend only
pnpm build

# Build desktop app
pnpm tauri build
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License. See [LICENSE](LICENSE).
