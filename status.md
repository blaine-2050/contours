# Contours Status

## Completed

### Infrastructure
- SvelteKit project initialized with TypeScript
- MDsveX configured for markdown processing
- adapter-node configured for Railway deployment
- Dev server set to port 5174 (to avoid conflicts)
- Vitest + Playwright testing infrastructure
- Unit tests for posts module (4 tests passing)

### Features
- **Home page** (`/`) - Lists all posts with title, date, author, category tags
- **Post view** (`/posts/[slug]`) - Displays individual post with image and categories
- **Admin create** (`/admin/create`) - Form to create posts with frontmatter, categories, and image upload
- **About page** (`/about`) - Blog description
- **Post persistence** - Markdown files in `./posts/*.md` with YAML frontmatter

### Light/Dark Mode
- Theme toggle in global header (moon/sun icons)
- Persists preference to localStorage
- Respects system preference on first visit
- CSS custom properties for theme colors

### Category System
- Category management at `/admin/categories` (add/remove)
- Categories stored in `data/categories.json`
- Post frontmatter supports `categories: [...]`
- Category checkboxes on create post form
- Category tags displayed on home page and post view
- `/category/[id]` route filters posts by category

### Image Support
- Drag-and-drop image upload on create post form
- Click to select file alternative
- Image preview before submission
- Images stored in `./posts/images/` with slug-based naming
- Image reference in post frontmatter (`image: filename.jpg`)
- `/images/[filename]` endpoint serves images
- Images displayed on post detail page

### Timestamp Support
- Time field on create post form (24-hour clock)
- Times stored in GMT in frontmatter (`time: HH:MM`)
- Dates displayed as "Thu Jan 09 2026 14:30 GMT" format
- Posts sorted by date and time (newest first)

### Search Functionality
- `/search` page with regex search support
- Searches across post titles and content
- Shows match context snippets
- Invalid regex patterns handled gracefully
- Search link in header navigation

### Stories Section
- Long-form content separate from posts at `/stories`
- Story listing with summaries
- Individual story view at `/stories/[slug]`
- Admin page at `/admin/stories` to create stories
- Stories stored in `./stories/*.md`
- Can include links to posts
- Stories link in header navigation

### Content
- Sample hello-world post
- Post on contours scope
- Upgrading blog post

### Branch Structure
- `main` - Production-ready blog (no beads)
- `Beads` - Beads integration work (blocked on 401 auth)

## Not Yet Pushed
- Remote (origin) not configured
- Will push to GitHub when ready

---
*Last updated: 2026-01-09*
