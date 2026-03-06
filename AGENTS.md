# Agent Coordination Guide

**Project:** Contours (SvelteKit Blog)  
**Multi-Agent Workflow:** Branch-per-workstream with merge coordination

---

## Branch Naming Convention

Each workstream gets its own branch:

```
workstream/{letter}-{short-name}

Examples:
  workstream/a-input-validation
  workstream/b-admin-auth
  workstream/c-security-headers
  workstream/d-connection-pooling
  etc.
```

---

## Workflow Rules

### 1. Before Starting Work

1. Check `todo.md` for the workstream you want to pick up
2. Verify no other agent has claimed it (check for `[IN PROGRESS]` marker)
3. Mark it `[IN PROGRESS]` in todo.md on `main`
4. Create your branch from latest `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b workstream/a-input-validation
   ```

### 2. During Development

- Work ONLY on files listed in your workstream
- Run tests frequently: `npm run test`
- Update **only your workstream's** todo items in `todo.md`
- Do NOT modify other workstreams' sections
- Do NOT modify shared infrastructure without discussion

### 3. Before Merging

1. Update todo.md in your branch:
   - Change `[IN PROGRESS]` to `[DONE]`
   - Mark individual tasks as complete
   - Add any discovered follow-up tasks to "Future Work" section

2. Run full test suite:
   ```bash
   npm run test
   npm run check
   ```

3. Rebase on main (if main has moved):
   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. Create PR/MR description with:
   - Workstream letter and name
   - Summary of changes
   - Test results
   - Any breaking changes or new env vars

### 4. After Merge

- Delete your branch
- Pick up next unclaimed workstream

---

## Conflict Resolution

If two workstreams touch the same file:

| Scenario | Resolution |
|----------|------------|
| Both modify same function | Merge in order (A, then B, then C...) and resolve |
| Both add to same config file | Later branch rebases and appends |
| One refactors file other modifies | Coordinate - refactoring branch merges first |

**Default merge order:** A → B → C → D → E → F → G → H → I → J → K

---

## Shared Files (High Risk)

These files require extra care - check with other agents if modifying:

```
src/hooks.server.ts           # Used by Workstream C, potentially others
src/lib/server/persistence/index.ts   # Core adapter factory
src/routes/+layout.svelte     # Global layout
todo.md                       # Everyone updates this
package.json                  # New dependencies
.env.example                  # New env vars
```

**Rule:** If your workstream needs to modify a "Shared File", mention it in your PR and ensure tests pass after merge.

---

## Testing Requirements

Every workstream must:

1. **Pass existing tests:** `npm run test` (unit)
2. **Type check:** `npm run check` 
3. **Manual verification:** Start dev server, verify key flows still work

Optional but encouraged:
- Add new tests for your functionality
- Run `npm run test:e2e` if you modified UI

---

## Environment Variables

Adding new env vars? Update these files:

1. `.env.example` - with documentation
2. `src/lib/server/` files that read the env var
3. Workstream task in `todo.md` - note the new env var

---

## Communication

- Each workstream is **independent** by design
- If you discover a dependency on another workstream, note it in `todo.md`
- If you find a bug in completed workstream code, fix it or flag it

---

## Quick Reference: Workstream Status

Check `todo.md` for current status. Key:

| Marker | Meaning |
|--------|---------|
| `[ ]` | Not started, available to claim |
| `[IN PROGRESS]` | Claimed, agent working on it |
| `[DONE]` | Merged to main |
| `[BLOCKED]` | Waiting on another workstream |

---

*Last updated: 2026-03-06*
