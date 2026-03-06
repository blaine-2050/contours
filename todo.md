# Contours Todo

**Multi-Agent Coordination:** See `AGENTS.md` for branch naming, workflow rules, and conflict resolution.

---

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
- [x] Provision MySQL on Railway and set `DATABASE_URL`
- [x] Run `npm run db:migrate` against Railway MySQL to create tables
- [x] Set `RAILWAY_DB_URL` in local `.env`, test publish workflow
- [x] Verify CRUD operations with `npm run dev:db` against test MySQL

---

## V1 M2 - Deploy Contours to Railway ✅ (2026-02-27)

- [x] Push to GitHub (blaine-2050)
- [x] Create Railway project (`contours`), provision MySQL service (`MySQL-LMyO`)
- [x] Configure environment variables (`PERSISTENCE=mysql`, `DATABASE_URL` via reference var, `NODE_ENV=production`, `PORT=3000`)
- [x] Wire SvelteKit adapter-node to Railway's port/host expectations (added `start` script)
- [x] Generate and run Drizzle migrations against Railway MySQL (5 tables created)
- [x] Publish local content to production DB (6 posts, 4 categories, 2 images, 0 errors)
- [x] Verify all pages return 200: homepage, posts, images, categories, stories, search, about
- **Live URL**: https://contours-app-production.up.railway.app
- **Deploy method**: `railway up` (CLI push). GitHub auto-deploy not yet wired (requires Railway GitHub app integration with blaine-2050 account).

---

## Phase 2A: Foundation (Can Start Immediately)

**Prerequisites:** None  
**Can run in parallel:** All workstreams in this phase  
**Merge order:** Any order (no conflicts expected)

### V2 M1 - Typography & Styling ✅

Improve visual hierarchy and readability of post content.

**Branch:** `workstream/m1-typography`  
**Risk:** Low - isolated to CSS and font loading  
**Shared files:** `src/routes/+layout.svelte` (adds font imports)

- [x] Add Merriweather font for headings
  - H1: 2.5rem bold, tighter letter-spacing (-0.02em)
  - H2: 1.75rem bold, letter-spacing (-0.01em)
  - H3: 1.25rem regular weight
- [x] Add Source Sans Pro for body text
- [x] Implement indent sizing: indented text drops one heading level in size
  - Created `.indented-content` class with left border
  - Indented paragraphs use H3-level body text (1.25rem)
- [x] Style blockquotes: enhanced indentation and spacing
  - Increased padding for better visual separation
  - Added first/last-child margin fixes

---

### Workstream A: Input Validation (Zod)

**Branch:** `workstream/a-input-validation`  
**Risk:** Low - new files only, minimal changes to existing  
**Shared files:** `+page.server.ts` files (add validation calls)  
**Depends on:** Nothing

- [x] Install Zod: `npm install zod`
- [x] Create `src/lib/validation/post.ts` with post schema
- [x] Create `src/lib/validation/story.ts` with story schema
- [x] Add validation to `/admin/create/+page.server.ts` `actions.create`
- [x] Add validation to `/admin/stories/+page.server.ts` `actions.create`
- [x] Add validation to `/admin/categories/+page.server.ts` `actions.add`
- [x] Return validation errors to forms with user-friendly messages

**Future work discovered:**
- [ ] Add client-side validation for better UX (optional)

---

### Workstream H: ESLint & Prettier Setup

**Branch:** `workstream/h-eslint-prettier`  
**Risk:** Low - config files only  
**Shared files:** All `.ts`, `.svelte` files (formatting only)  
**Depends on:** Nothing  
**Note:** Run this early - other branches can rebase on it to get formatting

- [x] Install dev dependencies: `npm install -D eslint @eslint/js typescript-eslint eslint-plugin-svelte prettier prettier-plugin-svelte`
- [x] Create `eslint.config.js` with TypeScript + Svelte rules
- [x] Create `.prettierrc` with project preferences
- [x] Add npm scripts: `lint`, `lint:fix`, `format`, `format:check`
- [x] Run initial format pass on all files
- [ ] Add lint check to CI (if/when CI exists)

---

### Workstream F: Health Check Endpoint ✅

**Branch:** `workstream/f-health-check`  
**Status:** Merged to main  
**Risk:** Very Low - new route only  
**Shared files:** None  
**Depends on:** Nothing

- [x] Create `src/routes/health/+server.ts` endpoint
- [x] Check database connectivity
- [x] Return JSON `{ status: 'ok', timestamp, version }`
- [x] Return 503 if database unreachable
- [x] Test with `curl http://localhost:5174/health`

---

### Workstream G: Structured Logging ✅

**Branch:** `workstream/g-structured-logging`  
**Risk:** Low - replaces console.log calls  
**Shared files:** `src/lib/server/logger.ts` (complete rewrite), many files (console.log → logger)  
**Depends on:** Nothing  
**Note:** Coordinate with Workstream B if both modify similar files

- [x] Rewrite `src/lib/server/logger.ts` for structured JSON output
- [x] Add log levels (debug, info, warn, error)
- [x] Add `LOG_LEVEL` env var support
- [x] Add request context (timestamp, correlation ID)
- [x] Update all existing `console.log` calls to use logger

---

## Phase 2B: Security Layer (After Phase 2A OR Parallel)

**Prerequisites:** Phase 2A recommended but not required  
**Can run in parallel:** Workstreams B, C within this phase  
**Merge order:** C (headers) before B (auth) recommended

### Workstream C: Security Headers & CSP ✅

**Branch:** `workstream/c-security-headers`  
**Status:** Complete  
**Risk:** Medium - CSP can break inline scripts  
**Shared files:** `src/hooks.server.ts` (modifies)  
**Depends on:** Nothing  
**Note:** Test admin forms thoroughly after implementing CSP

- [x] Modify `src/hooks.server.ts` to add CSP middleware
- [x] Add Content-Security-Policy header with directives:
  - default-src 'self'
  - script-src 'self'  
  - style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
  - font-src 'self' https://fonts.gstatic.com
  - img-src 'self' data: blob:
  - connect-src 'self'
  - frame-ancestors 'none'
  - base-uri 'self'
  - form-action 'self'
- [x] Add X-Frame-Options: DENY header
- [x] Add X-Content-Type-Options: nosniff header
- [x] Add Referrer-Policy: strict-origin-when-cross-origin header
- [x] Test that admin form submissions still work with CSP

**Future work discovered:**
- None - Svelte compiles event handlers properly, no inline script issues

---

### Workstream B: Production Admin Auth

**Important:** These changes apply to PRODUCTION ONLY. Local development (`npm run dev`) must remain unauthenticated for Blaine's convenience.

**Branch:** `workstream/b-admin-auth`  
**Risk:** High - affects all admin routes  
**Shared files:** `src/routes/admin/+layout.server.ts` (modifies), creates new routes  
**Depends on:** Workstream C recommended (CSP headers in place first)

- [ ] Add `ADMIN_PASSWORD` and `SESSION_SECRET` to `.env.example` (no default values)
- [ ] Create `src/routes/admin/login/+page.svelte` - login form for production
- [ ] Create `src/routes/admin/login/+page.server.ts` - validate password, set session cookie
- [ ] Modify `src/routes/admin/+layout.server.ts` - check session in production only
  - Must check `process.env.NODE_ENV === 'production'`
  - In dev mode, skip auth entirely
  - In production, redirect to `/admin/login` if no valid session
- [ ] Add logout button in admin layout

**Future work discovered:**
- [ ] Consider rate limiting on login attempts

---

## Phase 2C: Performance (After Phase 2A)

**Prerequisites:** Phase 2A complete (stable foundation)  
**Can run in parallel:** Workstreams D, E, I  
**Merge order:** D (pooling) before J (timestamps) if both touch adapter

### Workstream D: MySQL Connection Pooling

**Branch:** `workstream/d-connection-pooling`  
**Risk:** Medium - changes core database behavior  
**Shared files:** `src/lib/server/persistence/mysql-adapter.ts` (major changes)  
**Depends on:** Nothing

- [x] Modify `src/lib/server/persistence/mysql-adapter.ts`
- [x] Switch from `createConnection()` to `createPool()` (already was pool, added config)
- [x] Configure pool settings (connectionLimit: 10, acquireTimeout: 60000, timeout: 60000, queueLimit: 0)
- [x] Type check passed (0 errors)
- [x] Add pool end() cleanup on server shutdown
  - Exported `cleanupMySQLPool()` function
  - Added SIGTERM and SIGINT handlers in hooks.server.ts

---

### Workstream E: Caching Layer ✅

**Branch:** `workstream/e-caching-layer`  
**Status:** Complete  
**Risk:** Medium - can cause stale data if invalidation fails  
**Shared files:** `src/lib/server/cache.ts` (new), persistence files (add cache calls)  
**Depends on:** Nothing  
**Note:** Coordinate with Workstream J if both modify adapters

- [x] Install `npm install node-cache`
- [x] Create `src/lib/server/cache.ts` with Cache wrapper
- [x] Cache `getAllPosts()` results with 5-minute TTL
- [x] Cache `getAllStories()` results with 5-minute TTL
- [x] Cache `getCategories()` results with 5-minute TTL
- [x] Add cache invalidation on create/update/delete operations
- [x] Add `CACHE_TTL` env var for configuration

---

### Workstream I: Expand Test Coverage

**Branch:** `workstream/i-test-coverage`  
**Risk:** Low - only adds tests  
**Shared files:** `tests/` directory  
**Depends on:** Nothing, but ideally after Workstream A (validation) to test those schemas

- [x] Install coverage: `npm install -D @vitest/coverage-v8`
- [x] Add `test:coverage` script to package.json
- [x] Create `tests/unit/persistence.spec.ts` - test FileAdapter CRUD
- [x] Create `tests/unit/validation.spec.ts` - test Zod schemas (if A done)
- [x] Create `tests/unit/date.spec.ts` - test date utilities
- [x] Create `tests/e2e/admin.spec.ts` - create post flow
- [x] Create `tests/e2e/navigation.spec.ts` - homepage, theme toggle
- [x] Create `tests/e2e/search.spec.ts` - search functionality
- [x] Run full test suite and ensure all pass

---

## Phase 2D: Database Schema (After Phase 2C or Parallel)

**Prerequisites:** None, but D (pooling) recommended first  
**Merge order:** D before J if coordinating

### Workstream J: Timestamps & Indexes

**Branch:** `workstream/j-timestamps-indexes`  
**Risk:** Medium - requires migration on production  
**Shared files:** `src/lib/server/persistence/schema.ts`, adapters  
**Depends on:** Nothing

- [x] Modify `src/lib/server/persistence/schema.ts`
- [x] Add `created_at` timestamp to all tables
- [x] Add `updated_at` timestamp to all tables
- [x] Add database indexes:
  - `idx_posts_date` on `contours_posts.date`
  - `idx_posts_slug` on `contours_posts.slug`
  - `idx_categories_name` on `contours_categories.name`
- [x] Generate migration: `npm run db:generate`
- [x] Test migration locally with `npm run db:migrate`
- [x] Update adapters to set timestamps on create/update

**Production deployment note:** This requires running `npm run db:migrate` on Railway

---

### Workstream K: Image Optimization ✅

**Branch:** `workstream/k-image-optimization`  
**Status:** Complete  
**Risk:** Low-Medium - adds image processing dependency  
**Shared files:** `src/routes/images/[filename]/+server.ts`  
**Depends on:** Nothing

- [x] Install `npm install sharp`
- [x] Modify `src/routes/images/[filename]/+server.ts`
  - [x] Add query param support: `?w=800` for width
  - [x] Use Sharp to resize images on-the-fly
  - [x] Generate WebP versions on-the-fly (auto-detect via Accept header or `?format=webp`)
  - [x] Add cache headers for images (1 day)
  - [x] Limit max dimensions to prevent abuse (max 2000px)
  - [x] Handle errors gracefully (return original if processing fails)

---

## Phase 3: Shared DB Foundation (Documentation)

**This is research/documentation - does NOT block coding workstreams**

### V1 M3 - Shared DB Foundation (Crosscutting)

Contours deploys first but sets patterns for track-workout and medbridge.
This milestone is about documenting and validating the shared approach — not building other apps.

**Note:** This milestone can be worked on in parallel with all V2 workstreams. It doesn't produce code changes to Contours, only documentation.

- [ ] Document shared DB conventions in `~/Athenia/projects/CLAUDE.md` or a shared doc:
  - Table prefix per project (`contours_`, `tw_`, `mb_`)
  - snake_case table/column names
  - Common timestamp columns (`created_at`, `updated_at`)
  - Drizzle as standard ORM for Node projects
- [ ] Validate that track-workout and medbridge schemas can coexist in the same MySQL instance
- [ ] Document Railway MySQL provisioning steps (one instance, multiple logical schemas or prefixed tables)
- [ ] Create a shared connection-config pattern (env vars, connection pooling) reusable across projects

---

## Production Deployment Checklist

Before deploying any V2 changes to Railway:

- [ ] Rotate `RAILWAY_DB_URL` credentials (remove from git history)
- [ ] Set `ADMIN_PASSWORD` in Railway environment
- [ ] Set `SESSION_SECRET` in Railway environment (random 32+ chars)
- [ ] Set `LOG_LEVEL=info` in Railway environment
- [ ] Run `npm run db:migrate` against production DB
- [ ] Run smoke tests on all routes
- [ ] Verify admin login works in production
- [ ] Check logs are outputting JSON

---

## Phase 4: Git Journal API (V3 Extension)

**Goal:** Build API that extracts git commit history and generates blog posts automatically.

**Context:** This tests Path A (Playwright MCP) vs Path B (Stagehand) on API utilization rather than web scraping.

### Workstream: Git Journal API

**Branch:** `workstream/git-journal-api`  
**Risk:** Low - new API module, doesn't touch existing code  
**Shared files:** None - completely new module  
**Depends on:** Nothing

**API Specification:**
```typescript
// GET /api/commits?since=YYYY-MM-DD&until=YYYY-MM-DD
// Returns: [{ sha, message, date, author, summary }]

// POST /api/generate-post
// Body: { commits: Commit[], weekStart: string }
// Returns: { frontmatter: PostFrontmatter, content: string }

// POST /api/create-draft
// Body: { post: GeneratedPost }
// Action: Creates draft post in ./posts/
```

**Tasks:**
- [x] Create `src/lib/server/git-journal/` module
- [x] Implement `getCommits(since, until)` using `git log` command
- [x] Implement `generatePost(commits)` with formatting (no AI, keeps it simple)
- [x] Implement `createDraft(post)` that writes to ./posts/
- [x] Add API endpoints at `/api/journal/*`
- [x] Add manual trigger at `/admin/journal` UI
- [x] Test with actual commit history from this repo

**Deliverables:**
- Working API that can generate blog posts from git history
- Example generated post in ./posts/
- Documentation in `src/lib/server/git-journal/README.md`

**Future Evaluations:**
- After API complete, evaluate Path A vs Path B consuming this API
- Compare: formatting quality, edge case handling, reliability

---

## Future: Beads (V4+)

Beads integration for project memory / issue tracking. Blocked on 401 auth issue with beads CLI. Deferred until upstream resolves.

See `docs/implementation-plan.md` Workstream 2 for original design.

---
*Last updated: 2026-03-06
