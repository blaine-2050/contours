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

## V1 M1 - Backend Persistence

Git-file persistence works for local dev but won't survive Railway redeploys. Need a backend before deploying.

- [ ] Choose persistence backend (database, object storage, or headless CMS)
- [ ] Implement persistence adapter behind existing interface
- [ ] Ensure local-dev workflow still uses markdown files
- [ ] Migrate image storage to chosen backend

---

## V1 M2 - Deploy to Railway

Depends on M1: persistence must be production-ready before deploying.

- [ ] Push to GitHub (urban.huff.2050)
- [ ] Configure Railway project linked to GitHub repo
- [ ] Set environment variables for production persistence
- [ ] Verify post creation persists across redeploys
- [ ] Verify image upload works in production

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
