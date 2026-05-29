# Contributing to Wallpaper House

## Prerequisites

- Node.js 22+
- Rust 1.77.2+ (install via [rustup](https://rustup.rs))
- pnpm 9+ (`npm i -g pnpm`)
- Supabase CLI (optional, for database work)

## Setup

```bash
git clone https://github.com/Rukaiya-Akhter-Zerin/Wallpaper-House-2026.git
cd Wallpaper-House-2026
pnpm install
cp .env.example .env
pnpm tauri dev
```

## Code Style

- TypeScript strict mode
- ESLint + Prettier (run `pnpm lint` before committing)
- Rust: `cargo clippy -- -D warnings`
- Use `cn()` from `@/lib/utils` for className merging
- Use `motion/react` (not `framer-motion`) for animations

## Branch Naming

- `feature/*` — New features
- `fix/*` — Bug fixes
- `chore/*` — Maintenance tasks
- `docs/*` — Documentation updates

## Pull Request Process

1. Create a branch from `main`
2. Make your changes
3. Run `pnpm build` to verify TypeScript compiles
4. Run `cargo check` in `src-tauri/` to verify Rust compiles
5. Open a PR against `main`
6. Ensure CI passes

## Project Structure

```
src/                    # React frontend
  components/           # UI components
  hooks/                # React hooks
  stores/               # Zustand stores
  lib/                  # Utilities
  pages/                # Route pages
  types/                # TypeScript types
src-tauri/              # Rust backend
  src/commands/         # Tauri commands
  src/error.rs          # Error types
supabase/               # Database
  migrations/           # SQL migrations
  functions/            # Edge Functions
  seed.sql              # Seed data
```
