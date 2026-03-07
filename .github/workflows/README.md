# GitHub Actions Workflows

Automated CI/CD for Contours blog deployment to Railway.

---

## Workflows

### 1. `deploy.yml` - Production Deployment

**Triggers:**
- Push to `main` branch
- Manual trigger (workflow_dispatch)

**Steps:**
1. Run tests (75 tests must pass)
2. Run type check (0 errors)
3. Build project
4. Deploy to Railway

**Required Secret:**
- `RAILWAY_TOKEN` - Your Railway API token

### 2. `pr-check.yml` - Pull Request Validation

**Triggers:**
- Pull request to `main` branch

**Steps:**
1. Run tests
2. Run type check
3. Build project
4. Check formatting
5. Run linter

**Purpose:** Ensure PRs are safe to merge.

---

## Setup Instructions

### Step 1: Get Railway Token

1. Go to https://railway.app/dashboard
2. Click your profile (top right) → "Account Settings"
3. Go to "Tokens" tab
4. Generate new token (name: "GitHub Actions")
5. Copy the token (starts with `eyJ...`)

### Step 2: Add to GitHub Secrets

1. Go to https://github.com/blaine-2050/contours/settings/secrets/actions
2. Click "New repository secret"
3. Name: `RAILWAY_TOKEN`
4. Value: Paste your Railway token
5. Click "Add secret"

### Step 3: Connect Railway to GitHub (Alternative)

Instead of using tokens, you can connect directly:

1. Railway Dashboard → Your Project → Settings
2. Click "GitHub Repo"
3. Select `blaine-2050/contours`
4. Railway will auto-deploy on push

**Note:** If using direct GitHub integration, you may not need the token-based workflow.

---

## Deployment Flow

```
You: Push to main
    ↓
GitHub Actions: Run tests
    ↓
Tests Pass?
    ├─ YES → Deploy to Railway
    └─ NO  → Deployment blocked
```

---

## Monitoring Deployments

### GitHub UI
- Go to https://github.com/blaine-2050/contours/actions
- See deployment status
- View logs for each step

### Railway Dashboard
- Go to https://railway.app/dashboard
- See live deployment
- View runtime logs

### Command Line (optional)
```bash
# Check deployment status
gh run list --repo blaine-2050/contours

# View logs
gh run view --repo blaine-2050/contours <run-id>
```

---

## Troubleshooting

### Deployment Failed

1. Check GitHub Actions logs
2. Verify `RAILWAY_TOKEN` is set correctly
3. Ensure Railway service name matches (`contours`)

### Tests Failed

1. PR checks prevent broken code from merging
2. Fix issues locally: `npm run test`
3. Push fix, checks re-run automatically

### Manual Deployment

If GitHub Actions fails, deploy manually:
```bash
git checkout main
railway up
```

---

## Future: API-Driven Deployment

Goal: Deploy via API from phone

```bash
# POST to your API
POST https://your-api.com/deploy
{
  "suggestion": "Fix typo in homepage",
  "branch": "fix/typo-homepage"
}

# API creates PR
# Tests run
# Auto-merges
# Auto-deploys
```

This requires additional setup:
- API endpoint for PR creation
- Auto-merge bot (GitHub Apps)
- Secure authentication

For now, GitHub Actions + direct GitHub integration provides 90% of the automation with 10% of the complexity.
