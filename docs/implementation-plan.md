# Contours Blog Implementation Plan

## Overview
Three parallel workstreams to build Contours v1 - a persona blog for Blaine with beads-based project memory.

**Key Decision Made**: Custom SvelteKit + MDsveX (not swyxkit) for local markdown file support.

---

## Workstream 1: Blog Setup (Branch: `feature/blog-setup`)

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
   npm run dev  # http://localhost:5173
   ```

### Files to Create
- `svelte.config.js` - SvelteKit + MDsveX config
- `src/lib/server/posts.ts` - Post loading/creation logic
- `src/routes/+page.svelte` - Home page
- `src/routes/posts/[slug]/+page.svelte` - Post display
- `src/routes/admin/create/+page.svelte` - Post creation UI
- `posts/.gitkeep` - Posts directory
- `posts/images/.gitkeep` - Images directory

---

## Workstream 2: Beads Evaluation (Branch: `feature/beads-eval`)

### Goal
Install beads, create a test harness, and use it for issue tracking.

### Steps

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

### Files to Create
- `.beads/` - Beads data directory (auto-created)
- `src/lib/beads/client.ts` - TypeScript wrapper
- `scripts/beads-harness.ts` - CLI test harness
- `docs/beads-setup.md` - Setup documentation

---

## Workstream 3: Testing (Branch: `feature/testing`)

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

5. **Implement Test 2: Code Review Issue**
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

### Files to Create
- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration
- `tests/e2e/publish-post.spec.ts` - Hello world publication test
- `tests/integration/beads-issue.spec.ts` - Issue creation test
- `tests/setup.ts` - Test setup helpers

---

## Branch Strategy

```
main
├── feature/blog-setup      # Workstream 1
├── feature/beads-eval      # Workstream 2
└── feature/testing         # Workstream 3
```

Each workstream commits to its branch. Plans committed to git (not pushed).

---

## Verification Checklist

### Blog Setup Verification
- [ ] `npm run dev` starts local server at localhost:5173
- [ ] Can create post via admin UI
- [ ] Post appears in `./posts/` as markdown
- [ ] Post displays correctly on blog

### Beads Verification
- [ ] `bd` CLI installed and working
- [ ] `bd init` creates `.beads/` directory
- [ ] Test harness can create/list/close issues
- [ ] Issue "Review current code for good TypeScript style" exists

### Testing Verification
- [ ] `npm run test` passes unit/integration tests
- [ ] `npm run test:e2e` passes Playwright tests
- [ ] Hello world post successfully published in test
- [ ] TypeScript style review issue created via test

---

## Implementation Order

1. **Parallel Phase**: All three workstreams can start simultaneously on separate branches
2. **Integration Phase**: Merge branches to main after individual verification
3. **Final Verification**: Run all tests on main branch
4. **Commit Plans**: Commit all plan documents to git (no push to origin)

---

## Next Steps After Plan Approval

1. Create three feature branches
2. Implement each workstream (can be parallelized)
3. Run verification tests
4. Commit plans and code to git (local only)
