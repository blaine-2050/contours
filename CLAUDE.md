# Contours is a persona blog
# Inherits from: ~/Athenia/projects/CLAUDE.md (for TypeScript conventions)

## Stack: Node/TypeScript (SvelteKit)

## v1
- will be hosted on [Railway](https://railway.com/dashboard) from a GitHub repository.
- the name of the GitHub account is urban.huff.2050
- the name of the author of Contours is Blaine
- the initial technology will be
  - node
  - typescript
  - SvelteKit with MDsveX for markdown processing
  - persistence through git (local dev only)
    - using ./posts/*.md for text
    - using ./posts/images for images
    - production persistence TK (see todo.md V1 M1)

### use cases
#### V1
    - user creates a post by entering front matter containing
      - name of post
      - date / time of post
        - can be back dated
        - time is recorded on 24 hour clock GMT
      - author defaults to Blaine
      - text of post
    - user can switch between lite and dark modes 
    - user adds a category to dategory lists
    - user add a category to a post
    - user drags an image on to the post
      - only one is allowed
    - user searchs for post or posts by regex

    - user adds a long-form story to website. These are not posts, but appear under 'stories'. They often refer to posts so they need to be able to link to posts. They have dates just like posts, but typically concern more than that date
#### V2+
      - see todo.md for V2 milestones and future work

### pragmatic technical decisions
- the system needs to be modular so we can swap out persistence, UIUX, etc. as we progress through V1, V2...VN

### deployment
- Railway deployment from GitHub (urban.huff.2050)
- adapter-node configured for Railway compatibility
- Blocked: git-file persistence won't survive redeploys; need backend first (todo.md V1 M1)

### current status
- V1 feature-complete (2026-01-09):
  - Home page, post view, admin create, about page
  - Light/dark mode with localStorage persistence
  - Category system with management UI and filtering
  - Drag-and-drop image upload with preview
  - 24h GMT timestamps, date/time sorting
  - Regex search across titles and content
  - Stories section (long-form content, links to posts)
  - Vitest + Playwright testing infrastructure
- Blocked on backend persistence before Railway deploy (see todo.md V1 M1)
  
### persistence decision
- Git-file persistence (`./posts/*.md`) is local-dev only
- Production requires a backend (database or object storage) so content survives redeploys
- This is tracked as V1 M1 in todo.md; Railway deploy (V1 M2) depends on it

### running locally
```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # production build
npm run preview  # preview production build
```

### testing
```bash
npm run test     # unit/integration tests
npm run test:e2e # E2E tests (requires dev server)
```
