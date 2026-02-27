# Contours Blog Implementation Plan

## Overview

Architectural reference for Contours v1. For task tracking, see `todo.md`.

**Key Decision Made**: Custom SvelteKit + MDsveX (not swyxkit) for local markdown file support.

---

## Workstream 1: Blog Setup [COMPLETE]

### Goal
Set up a SvelteKit blog with local markdown posts in `./posts/*.md`.

### Steps

1. **Initialize SvelteKit project**
   ```bash
   npm create svelte@latest . -- --template=skeleton --typescript
   npm install
   ```

2. **Install dependencies**
   ```bash
   npm install mdsvex gray-matter
   npm install -D @sveltejs/adapter-node tailwindcss postcss autoprefixer
   ```

3. **Configure MDsveX** in `svelte.config.js`
   - Enable markdown processing
   - Configure frontmatter parsing
   - Set up syntax highlighting

4. **Create post structure**
   ```
   posts/
   ├── hello-world.md
   └── images/
   ```

5. **Implement post loader** (`src/lib/server/posts.ts`)
   - Read markdown files from `./posts/`
   - Parse YAML frontmatter (title, date, author)
   - Default author to "Blaine"
   - Support backdating

6. **Create routes**
   - `/` - Home/post listing
   - `/posts/[slug]` - Individual post view
   - `/admin/create` - Post creation form (V1 use case)

7. **Configure for local development**
   ```bash
   npm run dev  # http://localhost:5174
   ```

### Files Created
- `svelte.config.js` - SvelteKit + MDsveX config
- `src/lib/server/posts.ts` - Post loading/creation logic
- `src/routes/+page.svelte` - Home page
- `src/routes/posts/[slug]/+page.svelte` - Post display
- `src/routes/admin/create/+page.svelte` - Post creation UI
- `posts/.gitkeep` - Posts directory
- `posts/images/.gitkeep` - Images directory

---

## Workstream 2: Beads Evaluation [FUTURE - V3+]

Deferred. Beads CLI has a 401 auth blocker. Will revisit when upstream resolves. See `todo.md` Future section.

### Original Goal
Install beads, create a test harness, and use it for issue tracking.

### Steps (for reference)

1. **Install beads CLI**
   ```bash
   curl -sSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash
   ```

2. **Initialize beads in project**
   ```bash
   bd init
   ```

3. **Create TypeScript wrapper** (`src/lib/beads/client.ts`)
   - Wrap `bd` CLI commands via child_process
   - Expose typed API: `createIssue()`, `listIssues()`, `closeIssue()`

4. **Build test harness CLI** (`scripts/beads-harness.ts`)
   - Test issue creation
   - Test dependency management
   - Test listing and filtering
   - Test closing and compacting

5. **Create initial test issue**
   ```bash
   bd create --type task "Review current code for good TypeScript style"
   ```

6. **Document beads workflow** in `docs/beads-setup.md`

### Files to Create (when unblocked)
- `.beads/` - Beads data directory (auto-created)
- `src/lib/beads/client.ts` - TypeScript wrapper
- `scripts/beads-harness.ts` - CLI test harness
- `docs/beads-setup.md` - Setup documentation

---

## Workstream 3: Testing [COMPLETE]

### Goal
Set up testing infrastructure with two specific tests.

### Steps

1. **Install test dependencies**
   ```bash
   npm install -D vitest @vitest/ui @playwright/test
   npx playwright install
   ```

2. **Configure Vitest** (`vitest.config.ts`)
   - Unit tests for post logic
   - Integration tests for file operations

3. **Configure Playwright** (`playwright.config.ts`)
   - E2E tests against local dev server
   - WebServer integration

4. **Implement Test 1: Hello World Publication**
   ```typescript
   // tests/e2e/publish-post.spec.ts
   test('publish hello world post to local server', async ({ page }) => {
     // Navigate to create post page
     // Fill frontmatter (title, date, content)
     // Submit and verify post appears
     // Verify markdown file created in ./posts/
   });
   ```

5. **Implement Test 2: Code Review Issue** (deferred with Beads)
   ```typescript
   // tests/integration/beads-issue.spec.ts
   test('create TypeScript style review issue', async () => {
     // Use beads client to create issue
     // Title: "Review current code for good TypeScript style"
     // Verify issue exists in beads
   });
   ```

6. **Add npm scripts**
   ```json
   {
     "test": "vitest run",
     "test:e2e": "playwright test",
     "test:all": "npm run test && npm run test:e2e"
   }
   ```

### Files Created
- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration
- `tests/e2e/publish-post.spec.ts` - Hello world publication test
- `tests/setup.ts` - Test setup helpers

---

## Branch Strategy

All work is on `main`. Feature branches were used during initial development and merged back.

---

## Verification Checklist

### Blog Setup [DONE]
- [x] `npm run dev` starts local server at localhost:5174
- [x] Can create post via admin UI
- [x] Post appears in `./posts/` as markdown
- [x] Post displays correctly on blog

### Beads [DEFERRED]
- [ ] `bd` CLI installed and working (blocked on 401 auth)

### Testing [DONE]
- [x] `npm run test` passes unit/integration tests (4 tests)
- [x] `npm run test:e2e` Playwright configured
