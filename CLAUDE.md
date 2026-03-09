# Contours is a persona blog
# Inherits from: ~/Athenia/projects/CLAUDE.md (for TypeScript conventions)

## Stack: Node/TypeScript (SvelteKit)

## v1
- will be hosted on [Railway](https://railway.com/dashboard) from a GitHub repository.
- the name of the GitHub account is blaine-2050
- the name of the author of Contours is Blaine
- the initial technology will be
  - node
  - typescript
  - SvelteKit with MDsveX for markdown processing
  - persistence abstraction with two adapters:
    - **FileAdapter** (default): `./posts/*.md`, `./stories/*.md`, `data/categories.json`, `./posts/images/`
    - **MysqlAdapter** (production): Drizzle ORM + mysql2, tables prefixed `contours_`
  - adapter selection via `PERSISTENCE` env var (`file` | `mysql`)

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

### persistence env vars
- `PERSISTENCE` — adapter selection (`file` | `mysql`)
- `DATABASE_URL` — production MySQL connection string
- `RAILWAY_DB_URL` — local publish to Railway DB

## crosscutting concerns
- this project needs to be compatable with some other projects under the /Users/dev/Athenia/projects tree. In particular we will end up with both Python and Node servers on Railway. In additiion we will have multiple apps running on both platforms.
- This will be the first project deployed, but it will save a lot of work if we design and implement it with that type of future in mind.
- review the sibling projects track-workout and medbridge for an overview of database needs. Right now, I think all of them can use the same DB and on Railway, MySQL is the best fit.
- update todo.md as appropriate. it may need some reorganization. It should help us focus on this bloggging app before addtional implementations.
