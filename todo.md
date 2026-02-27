# Contours Todo

## V1 Completed

All V1 features shipped. See `docs/implementation-plan.md` for architectural details.

### Infrastructure
- SvelteKit project with TypeScript
- MDsveX configured for markdown processing
- adapter-node configured for Railway deployment
- Dev server on port 5174
- Vitest + Playwright testing infrastructure (4 unit tests passing)

### Features
- **Home page** (`/`) - post listing with title, date, author, category tags
- **Post view** (`/posts/[slug]`) - individual post with image and categories
- **Admin create** (`/admin/create`) - post creation with frontmatter, categories, image upload
- **About page** (`/about`) - blog description
- **Post persistence** - markdown files in `./posts/*.md` with YAML frontmatter

### Light/Dark Mode
- Theme toggle in global header (moon/sun icons)
- Persists to localStorage, respects system preference on first visit

### Category System
- Category management at `/admin/categories`
- Categories stored in `data/categories.json`
- Category tags on home page and post view
- `/category/[id]` route filters posts by category

### Image Support
- Drag-and-drop image upload on create post form (click-to-select alternative)
- Image preview before submission
- Images stored in `./posts/images/` with slug-based naming
- `/images/[filename]` endpoint serves images

### Timestamp Support
- 24-hour clock times stored in GMT (`time: HH:MM`)
- Posts sorted by date and time (newest first)

### Search
- `/search` page with regex support across titles and content
- Match context snippets, graceful handling of invalid regex

### Stories
- Long-form content at `/stories` and `/stories/[slug]`
- Admin page at `/admin/stories`
- Stories stored in `./stories/*.md`, can link to posts

### Content
- Sample hello-world post
- Post on contours scope
- Upgrading blog post

---

## V1 M1 - MySQL Persistence ✅ (2026-02-27)

Implemented persistence abstraction with file and MySQL adapters.

### What was built
- **Persistence interface** (`PersistenceAdapter`) in `src/lib/server/persistence/types.ts`
- **File adapter** (`FileAdapter`) — refactored from original modules, zero behavior change
- **MySQL adapter** (`MysqlAdapter`) — Drizzle ORM with mysql2, all CRUD + search via REGEXP
- **Schema** — `contours_posts`, `contours_post_categories`, `contours_categories`, `contours_stories`, `contours_images` (MEDIUMBLOB)
- **Adapter factory** — `getAdapter()` returns FileAdapter by default, MysqlAdapter when `PERSISTENCE=mysql`
- **Publish endpoint** (`/admin/publish`) — syncs local files to Railway MySQL with upsert logic (insert/update/skip by content hash)
- **Publish UI** — button + results table at `/admin/publish`

### Environment variables
| Variable | Where | Purpose |
|---|---|---|
| `PERSISTENCE` | Production: `mysql`. Local: unset (defaults `file`) | Adapter selection |
| `DATABASE_URL` | Production Railway env | App reads/writes via MySQL adapter |
| `RAILWAY_DB_URL` | Local `.env` only | Publish endpoint connects to remote DB |

### Scripts
- `npm run dev` — file-based persistence (default, offline)
- `npm run dev:db` — MySQL persistence mode
- `npm run db:generate` — generate Drizzle migrations
- `npm run db:migrate` — run Drizzle migrations

### Remaining before M2 deploy
- [ ] Provision MySQL on Railway and set `DATABASE_URL`
- [ ] Run `npm run db:migrate` against Railway MySQL to create tables
- [ ] Set `RAILWAY_DB_URL` in local `.env`, test publish workflow
- [ ] Verify CRUD operations with `npm run dev:db` against test MySQL

---

## V1 M2 - Deploy Contours to Railway

Depends on M1: persistence must be production-ready before deploying.

- [ ] Push to GitHub (urban.huff.2050)
- [ ] Create Railway project, provision MySQL service
- [ ] Configure environment variables (DB connection string, `NODE_ENV=production`)
- [ ] Wire SvelteKit adapter-node to Railway's port/host expectations
- [ ] Verify post create/read persists across redeploys
- [ ] Verify image upload works in production
- [ ] Set up Railway auto-deploy from `main` branch

---

## V1 M3 - Shared DB Foundation (Crosscutting)

Contours deploys first but sets patterns for track-workout and medbridge.
This milestone is about documenting and validating the shared approach — not building other apps.

- [ ] Document shared DB conventions in `~/Athenia/projects/CLAUDE.md` or a shared doc:
  - Table prefix per project (`contours_`, `tw_`, `mb_`)
  - snake_case table/column names
  - Common timestamp columns (`created_at`, `updated_at`)
  - Drizzle as standard ORM for Node projects
- [ ] Validate that track-workout and medbridge schemas can coexist in the same MySQL instance
- [ ] Document Railway MySQL provisioning steps (one instance, multiple logical schemas or prefixed tables)
- [ ] Create a shared connection-config pattern (env vars, connection pooling) reusable across projects

---

## V2 M1 - Typography & Styling

Improve visual hierarchy and readability of post content.

- [ ] Add Merriweather font for headings
  - H1: bold, larger size, slightly tighter letter-spacing
  - H2: semi-bold or bold, smaller than H1
  - H3: regular or semi-bold, close to body size but distinct
- [ ] Add Source Sans Pro for body text
- [ ] Implement indent sizing: indented text drops one heading level in size
  - e.g., indented paragraph under H2 uses H3-level body text
- [ ] Style blockquotes: indented, vertical bar on left

---

## Future: Beads (V3+)

Beads integration for project memory / issue tracking. Blocked on 401 auth issue with beads CLI. Deferred until upstream resolves.

See `docs/implementation-plan.md` Workstream 2 for original design.

---
*Last updated: 2026-02-27*
