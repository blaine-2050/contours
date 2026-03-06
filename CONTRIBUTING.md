# Contribution Guidelines

**Parent:** [AGENTS.md](./AGENTS.md) - Start there for coordination rules  
**Purpose:** Commit message conventions and traceability for multi-agent work

## Commit Message Convention

Format:
```
<type>(<workstream>): <short summary>

<body - what changed and why>

Refs: <workstream-id>
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `test` - Tests
- `refactor` - Code refactoring
- `chore` - Build/process changes

### Workstream Identifiers

Use the workstream code from `todo.md`:
```
A - Input Validation
B - Admin Auth
C - Security Headers
D - Connection Pooling
E - Caching
F - Health Check
G - Logging
H - ESLint
I - Tests
J - Timestamps
K - Image Optimization
M1 - Typography
```

### Examples

**Good:**
```
feat(A): Add Zod validation schemas for posts and stories

- Create validation/post.ts with title/content/date schemas
- Create validation/story.ts with summary validation
- Integrate validation into admin create actions

Refs: Workstream A
```

**Good (merge commit):**
```
merge(B): Production admin authentication

Adds login page, session management, and production-only auth guard.
Security: HttpOnly, Secure, SameSite=strict cookies.

Refs: Workstream B, todo.md Phase 2B
```

**Bad (avoid):**
```
Workstream E: Caching Layer
```
- No type prefix
- No context about what changed
- Will be meaningless in 6 months

## Branch Naming

```
workstream/<letter>-<short-name>

Examples:
  workstream/a-input-validation
  workstream/b-admin-auth
  workstream/j-timestamps
```

## Traceability

Every workstream should be traceable:

1. **Branch** → `workstream/a-input-validation`
2. **Commits** → `feat(A): Add Zod validation`
3. **TODO** → `todo.md` Workstream A section
4. **Status** → `.agent-status.md` entry
5. **Log** → `logs/workstream-a.log`

## Finding History

To find all commits related to a workstream:

```bash
# Search by workstream letter in commit message
git log --grep="(A):" --oneline

# Search merge commits
git log --grep="merge(A)" --oneline

# Search all refs to workstream
git log --all --grep="Workstream A" --oneline
```

## Long-Term Maintenance

When `todo.md` phases change (completed workstreams removed):

1. Keep workstream IDs in commit messages - they remain searchable
2. Archive completed phases to `docs/completed-phases.md`
3. Update this file with retired workstream codes

## Phase History

### Phase 2A - Foundation (COMPLETE)
- F: Health Check
- A: Input Validation
- H: ESLint & Prettier
- G: Structured Logging
- M1: Typography & Styling

### Phase 2B - Security (COMPLETE)
- C: Security Headers & CSP
- B: Production Admin Auth

### Phase 2C - Performance (COMPLETE)
- D: MySQL Connection Pooling
- E: Caching Layer
- I: Test Coverage

### Phase 2D - Database Schema (PENDING)
- J: Timestamps & Indexes
- K: Image Optimization
