# Contours TODO

## Pending Migrations

### MySQL: add `technical` column (from feat/technical-content-flag)
- [ ] Run `npx drizzle-kit generate` to create migration SQL
- [ ] Run `npx drizzle-kit push` against production DB (or apply generated migration)
- [ ] The column is `NOT NULL DEFAULT false` — no data backfill needed
- [ ] After migration, republish posts so `technical: true` syncs from file frontmatter to DB

**Context:** Added `technical` boolean to `contours_posts` schema in commit c5c5af0. Existing DB rows will default to `false`. The file adapter already reads `technical: true` from dev-journal post frontmatter, so a publish (`/admin/publish` in dev mode) will sync the values.

## Future Work

- See CLAUDE.md V2+ notes
