# Contours Deployment Guide

**Version:** V2 Complete (Phases 2A, 2B, 2C, 2D)  
**Target:** Railway Production  
**Database:** Shared MySQL with prefixed tables (`contours_*`)

**Deployment Method:** GitHub Actions (automated) or Railway CLI (manual)

---

## Quick Start (Automated)

Once GitHub Actions is configured, deployment is automatic:

```
You: git push origin main
    ↓
GitHub Actions: Tests → Build → Deploy
    ↓
Railway: Live site updated
```

**Setup time:** 5 minutes  
**Deployment time:** 2-3 minutes after push

See `.github/workflows/README.md` for setup instructions.

---

## Architecture Overview

---

## Overview

This document describes deploying Contours to Railway with:
- Full V2 feature set (validation, auth, caching, security, timestamps, image optimization)
- Narrative blog posts generated from git history
- Shared DB conventions for multi-project setup
- Git Journal API for ongoing documentation

---

## Pre-Deployment Checklist

### Local Verification

```bash
# 1. Run tests
npm run test          # Should show: 75 tests passing

# 2. Type check
npm run check         # Should show: 0 errors

# 3. Build verification
npm run build         # Should complete without errors

# 4. Local dev smoke test
npm run dev &
curl http://localhost:5174/health  # Should return JSON with status: ok
curl http://localhost:5174/        # Should show homepage with posts
```

### Environment Variables

Create `.env.production` (not committed):

```bash
# Required
NODE_ENV=production
PERSISTENCE=mysql
DATABASE_URL=mysql://user:pass@host:port/railway
ADMIN_PASSWORD=your_secure_password_here
SESSION_SECRET=random_32_character_string

# Optional
LOG_LEVEL=info
CACHE_TTL=300
PORT=3000
```

**Never commit `.env.production` to git.**

---

## Deployment Steps

### Option A: Automated (GitHub Actions) - RECOMMENDED

**Prerequisites:**
1. GitHub repository connected to Railway OR `RAILWAY_TOKEN` secret set
2. Environment variables configured in Railway dashboard
3. Database migrated (one-time setup)

**Deploy:**
```bash
# Just push to main
git checkout main
git status        # should be clean
git push origin main

# GitHub Actions handles the rest:
# 1. Runs tests (75 must pass)
# 2. Runs type check (0 errors)
# 3. Builds project
# 4. Deploys to Railway
```

**Monitor:**
- GitHub: https://github.com/blaine-2050/contours/actions
- Railway: https://railway.app/dashboard

### Option B: Manual (Railway CLI)

**Use when:**
- GitHub Actions is down
- Emergency hotfix needed
- Testing deployment process

```bash
# 1. Push code
git checkout main
git push origin main

# 2. Deploy via CLI
railway login
railway up

# 3. Run migrations (if needed)
export DATABASE_URL="your-railway-db-url"
npm run db:migrate
```

### Step 1: Database Migration (One-time)

```bash
# Run migrations against Railway MySQL
export DATABASE_URL="mysql://user:pass@host:port/railway"
npm run db:migrate
```

This creates:
- `contours_posts` (with timestamps)
- `contours_categories` (with timestamps)
- `contours_post_categories` (with timestamps)
- `contours_stories` (with timestamps)
- `contours_images` (with timestamps)

All tables use the `contours_` prefix per SHARED_DB.md conventions.

### Step 4: Verify Deployment

```bash
# Health check
curl https://your-railway-url/health
# Expected: {"status":"ok","timestamp":"...","version":"0.0.1"}

# Homepage
curl https://your-railway-url/
# Should show blog with posts

# Admin (will redirect to login in production)
curl -I https://your-railway-url/admin
# Should redirect to /admin/login
```

---

## Narrative Posts Deployment

### What Gets Deployed

The narrative posts in `posts/` are markdown files that get:
1. Read by the blog at startup
2. Displayed on homepage (sorted by date)
3. Rendered via MDsveX with frontmatter

### Current Narrative Posts

| Post | Date | Style | Content Focus |
|------|------|-------|---------------|
| week-of-2026-01-27 | Jan 27 | Default | Initial commit |
| preparing-for-v1 | Feb 17 | Narrative | Pre-V1 work |
| v1-launch-persistence-deployment | Feb 24 | Narrative | MySQL & Railway |
| week-of-2026-02-24 | Feb 24 | Default | V1 summary |
| week-of-2026-03-03 | Mar 3 | Default | 33 commits |
| health-check-monitoring-endpoint | Mar 6 | Technical | /health endpoint |
| input-validation-with-zod | Mar 6 | Technical | Zod validation |
| typography-overhaul-merriweather | Mar 6 | Technical | Fonts & design |
| mysql-connection-pooling | Mar 6 | Technical | DB pooling |
| week-of-mar-3-narrative | Mar 3 | Narrative | V2 story |
| week-of-mar-3-technical | Mar 3 | Technical | V2 architecture |

### Future Posts

Use the Git Journal API at `/admin/journal` to generate new posts:
1. Select date range
2. Preview generated post
3. Edit as needed
4. Create draft
5. Remove `draft: true` from frontmatter to publish

---

## Shared DB Context

### Why Shared DB?

Contours uses the conventions from `~/Athenia/projects/SHARED_DB.md`:

- **Table prefix**: `contours_*` prevents collision with other projects
- **Single MySQL instance**: Cost-efficient on Railway
- **Drizzle ORM**: Standard across Node projects

### Coexistence

In the same Railway MySQL instance, you can have:
```sql
-- Contours tables
contours_posts
contours_categories
contours_images

-- Future: track-workout tables
tw_workouts
tw_exercises
tw_sets

-- Future: medbridge tables
mb_patients
mb_appointments
```

No conflicts due to prefixes.

---

## Post-Deployment Verification

### Critical Paths

Test these flows:

```bash
# 1. Public pages
GET /           # Homepage with posts
GET /posts/*    # Individual posts
GET /about      # About page
GET /health     # Health check
GET /images/*   # Image serving (with Sharp optimization)

# 2. Admin (requires auth in production)
GET /admin/login          # Login form
POST /admin/login         # Auth with ADMIN_PASSWORD
GET /admin/create         # Create post form
POST /admin/create        # Submit new post
GET /admin/journal        # Git Journal API UI

# 3. API endpoints
GET /api/journal/commits?since=2026-03-01&until=2026-03-07
POST /api/journal/generate
```

### Smoke Test Script

```bash
#!/bin/bash
BASE_URL="https://your-railway-url"

echo "Testing public endpoints..."
curl -sf "$BASE_URL/" > /dev/null && echo "✓ Homepage"
curl -sf "$BASE_URL/health" > /dev/null && echo "✓ Health check"
curl -sf "$BASE_URL/about" > /dev/null && echo "✓ About page"

echo ""
echo "Testing admin (should redirect to login)..."
curl -sf -o /dev/null -w "%{http_code}" "$BASE_URL/admin" | grep -q "302\|200" && echo "✓ Admin accessible"

echo ""
echo "Testing API..."
curl -sf "$BASE_URL/api/journal/commits?since=2026-03-01&until=2026-03-07" > /dev/null && echo "✓ Git Journal API"

echo ""
echo "All tests passed!"
```

---

## Rollback Plan

If deployment fails:

```bash
# 1. Check Railway logs
railway logs

# 2. Verify environment variables
railway variables

# 3. Rollback to previous deployment
railway rollback

# 4. Check database connection
# Verify DATABASE_URL is correct and MySQL is accessible

# 5. Common issues:
# - Missing ADMIN_PASSWORD or SESSION_SECRET
# - DATABASE_URL pointing to wrong database
# - Migration not run (tables don't exist)
```

---

## Ongoing Maintenance

### Weekly (Automated)

The Git Journal API can generate weekly posts:
1. Visit `/admin/journal`
2. Select previous week
3. Generate post
4. Review and edit
5. Publish

### Monthly (Manual)

```bash
# Check logs for errors
railway logs --tail 100

# Review and rotate if needed
git log --oneline origin/main..main  # Check if local is ahead

# Update dependencies
npm audit
npm update
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Railway                               │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │  MySQL          │  │  Contours App (Node/SvelteKit)   │  │
│  │  ┌───────────┐  │  │  ┌──────────┐  ┌──────────────┐  │  │
│  │  │contours_* │  │  │  │  Routes  │  │  Blog Posts  │  │  │
│  │  │  tables   │  │  │  │  + API   │  │  (markdown)  │  │  │
│  │  └───────────┘  │  │  └──────────┘  └──────────────┘  │  │
│  │                 │  │  ┌──────────┐  ┌──────────────┐  │  │
│  │  Future:        │  │  │  Git     │  │  Admin UI    │  │  │
│  │  tw_workouts    │  │  │  Journal │  │  (auth)      │  │  │
│  │  mb_patients    │  │  │  API     │  │              │  │  │
│  └─────────────────┘  │  └──────────┘  └──────────────┘  │  │
│                       └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Contact & References

- **Shared DB Conventions**: `~/Athenia/projects/SHARED_DB.md`
- **Blogging Experiments**: `~/Athenia/projects/blogging-commit-experiments.md`
- **Git Journal API**: `/admin/journal` (local) or `https://your-railway-url/admin/journal`

---

*Last updated: 2026-03-07*  
*Deployment Version: V2 Complete*
