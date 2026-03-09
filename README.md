# Contours

A persona blog by Blaine built with SvelteKit. Posts with front matter, categories, image uploads, light/dark mode, regex search, and long-form stories.

## Stack

- **Runtime**: Node.js / TypeScript
- **Framework**: SvelteKit with MDsveX for markdown processing
- **ORM**: Drizzle ORM + mysql2
- **Database**: MySQL (shared Railway instance, `contours_` table prefix)
- **Persistence**: Pluggable adapter pattern — file-based (local) or MySQL (production)

## Running Locally

```bash
npm install
npm run dev        # http://localhost:5174 (file-based persistence)
npm run dev:db     # MySQL persistence mode (requires DATABASE_URL)
npm run build      # production build
npm run preview    # preview production build
```

## Testing

```bash
npm run test       # unit/integration tests (Vitest)
npm run test:e2e   # E2E tests (Playwright, requires dev server)
npm run test:all   # both
```

## Project Structure

```
src/lib/server/persistence/   # persistence layer
├── models.ts                 # shared interfaces (Post, Category, Story, SearchResult)
├── types.ts                  # PersistenceAdapter interface + input types
├── file-adapter.ts           # reads/writes markdown files and JSON (local dev)
├── mysql-adapter.ts          # Drizzle ORM with mysql2 (production)
├── schema.ts                 # Drizzle table definitions (contours_ prefixed)
└── index.ts                  # adapter factory (getAdapter/initAdapter)

src/hooks.server.ts            # initializes adapter at server startup
scripts/generate-multi-repo-journal.ts  # dev-journal post generator
```

**Persistence adapters:**
- **FileAdapter** (default): `./posts/*.md`, `./stories/*.md`, `data/categories.json`, `./posts/images/`
- **MysqlAdapter** (production): Drizzle ORM + mysql2, tables prefixed `contours_`
- Selected via `PERSISTENCE` env var (`file` | `mysql`)

## Scripts & Tools

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server on port 5174 (file persistence) |
| `npm run dev:db` | Dev server with MySQL persistence |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Vitest unit/integration tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:all` | All tests |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run Drizzle migrations |
| `npm run journal:generate` | Generate dev-journal posts from git history |
| `npm run check` | TypeScript/Svelte type checking |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |

## Claude Skills

Project-specific Claude skills live in `.claude/commands/`.

| Skill | Usage | Description |
|-------|-------|-------------|
| `/journal` | `/journal` or `/journal contours` | Generate dev-journal posts from git history across all tracked repos. Lists drafts, lets you pick which to publish, optionally pushes to GitHub for Railway deploy. |

## Deployment

- **Platform**: Railway (https://railway.com)
- **GitHub**: blaine-2050
- **Deploy pattern**: GitHub auto-deploy from `main` branch
- **Adapter**: adapter-node configured for Railway compatibility
- **Env vars**: `PERSISTENCE`, `DATABASE_URL`, `RAILWAY_DB_URL` (see `.env.example`)

## Current Status

V1 feature-complete (2026-01-09), persistence layer complete (2026-02-27):
- Home page, post view, admin create, about page
- Light/dark mode with localStorage persistence
- Category system with management UI and filtering
- Drag-and-drop image upload with preview
- 24h GMT timestamps, date/time sorting
- Regex search across titles and content
- Stories section (long-form content, links to posts)
- Vitest + Playwright testing infrastructure
- PersistenceAdapter interface with FileAdapter + MysqlAdapter
- "Publish to Railway" UI at `/admin/publish`

Next: V1 M2 (Railway deploy) — see `todo.md`
