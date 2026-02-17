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
  - persistence through git
    - using ./posts/*.md for text
    - using ./posts/images for images

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
#### V2
      - user can drag and drop an image to the post

### pragmatic technical decisions
- the system needs to be modular so we can swap out persistence, UIUX, etc. as we progress through V1, V2...VN

### deployment
- Railway deployment from GitHub (urban.huff.2050)
- adapter-node configured for Railway compatibility

### current status
- SvelteKit blog is functional with:
  - Home page listing posts
  - Individual post view
  - Admin page to create new posts
  - Local markdown file persistence
- Ready for deployment to Railway
  
### questions before remote deployment
  - if I push this to github and then use railway tools to deploy, I believe I'll have a working blog seeded with some inital contents.
  - At that point I expect to be able to use the UI to add a new post and drag an immage to it. I believe the new data will be living on railway. true?
    - if true, then when I deploy a new version, I expect that new content wold be blown away. true?
  - it will be very confientent to ads posts from either my dev environment or from Railway. I think this will require a more sophistocated back end.
  - Please advise.

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
