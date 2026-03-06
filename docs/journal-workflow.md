# Git Journal Workflow

This document explains how to generate blog posts from git commit history using the Git Journal API.

## Overview

The Git Journal feature automatically creates dev journal posts by:
1. Extracting commits from git history within a date range
2. Generating markdown content with categorized commits
3. Creating draft posts in the `./posts/` directory

## API Endpoints

### 1. Get Commits

```bash
GET /api/journal/commits?since=YYYY-MM-DD&until=YYYY-MM-DD
```

**Example:**
```bash
curl "http://localhost:5174/api/journal/commits?since=2026-03-03&until=2026-03-09"
```

**Response:**
```json
{
  "commits": [
    {
      "sha": "90ad30f...",
      "message": "feat(git-journal): Add API for generating blog posts",
      "date": "2026-03-07",
      "author": "Blaine"
    }
  ],
  "count": 32,
  "since": "2026-03-03",
  "until": "2026-03-09"
}
```

### 2. Generate Post

```bash
POST /api/journal/generate
Content-Type: application/json

{
  "commits": [...],
  "weekStart": "2026-03-03"
}
```

**Example:**
```bash
curl -X POST "http://localhost:5174/api/journal/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "commits": [...],
    "weekStart": "2026-03-03"
  }'
```

**Response:**
```json
{
  "frontmatter": {
    "title": "Week of 2026-03-03 - 32 commits",
    "date": "2026-03-03",
    "author": "Contours Bot",
    "categories": ["dev-journal"]
  },
  "content": "...markdown content...",
  "preview": "...first 500 chars..."
}
```

### 3. Create Draft

```bash
POST /api/journal/create-draft
Content-Type: application/json

{
  "post": {
    "frontmatter": {...},
    "content": "..."
  }
}
```

**Note:** Only available in development mode (`npm run dev`).

## Complete Workflow

### Option 1: API Calls (Recommended)

```bash
#!/bin/bash

BASE_URL="http://localhost:5174"
WEEK_START="2026-03-03"
WEEK_END="2026-03-09"

# Step 1: Get commits
COMMITS=$(curl -s "${BASE_URL}/api/journal/commits?since=${WEEK_START}&until=${WEEK_END}")

# Step 2: Generate post
POST=$(echo "$COMMITS" | jq '{ 
  commits: .commits, 
  weekStart: "'${WEEK_START}'" 
}' | curl -s -X POST "${BASE_URL}/api/journal/generate" \
  -H "Content-Type: application/json" -d @-)

# Step 3: Create draft
echo "$POST" | jq '{
  post: {
    frontmatter: .frontmatter,
    content: .content
  }
}' | curl -s -X POST "${BASE_URL}/api/journal/create-draft" \
  -H "Content-Type: application/json" -d @-
```

### Option 2: Admin UI

Visit `http://localhost:5174/admin/journal` in development mode for a web interface to generate posts.

## Post Structure

Generated posts include:

- **Frontmatter**: Title, date, author, categories, draft status
- **Summary**: Overview of commit count and period
- **Categorized Commits**: Grouped by type (feat, fix, docs, test, etc.)
- **Commit Activity**: Table showing commits per day

## Customization

### Editing Generated Posts

1. Generated posts are saved to `./posts/dev-journal-week-of-YYYY-MM-DD.md`
2. Edit the markdown file directly for clarity and context
3. Remove `draft: true` from frontmatter to publish
4. Rename the file for a better slug if desired

### Commit Types

The generator recognizes conventional commit prefixes:

| Prefix | Category |
|--------|----------|
| `feat:` | ✨ Features |
| `fix:` | 🐛 Bug Fixes |
| `docs:` | 📚 Documentation |
| `style:` | 💎 Code Style |
| `refactor:` | ♻️ Refactoring |
| `test:` | 🧪 Tests |
| `chore:` | 🔧 Chores |
| (other) | 📝 Other |

## Best Practices

1. **Weekly cadence**: Generate posts at the end of each week
2. **Review before publishing**: Edit for clarity and context
3. **Add summaries**: Include high-level achievements in the intro
4. **Keep commit messages clear**: They become the post content
5. **Group related work**: Use consistent prefixes for related commits

## Example Posts

See existing dev journal posts:
- `posts/dev-journal-2026-02-24-v1-completion.md`
- `posts/dev-journal-2026-03-03-v2-foundation.md`

## Troubleshooting

### No commits found

- Verify date range format: `YYYY-MM-DD`
- Check that commits exist in the range: `git log --since="2026-03-01" --until="2026-03-07"`

### Draft creation fails

- Ensure dev server is running (`npm run dev`)
- Check that `./posts/` directory exists and is writable
- Verify you're in development mode (not production)

### API errors

- Check server logs for detailed error messages
- Verify request format matches expected JSON structure
- Ensure all required fields are present

## Future Enhancements

- [ ] AI-generated summaries for commit groups
- [ ] Automatic image generation for post headers
- [ ] Integration with GitHub API for PR/MR data
- [ ] RSS feed for dev journal category
