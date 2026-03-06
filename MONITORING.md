# Multi-Agent Monitoring & Coordination

**Goal:** Track agent progress, detect blockers, and coordinate without overwhelming you with noise.

---

## Recommended Approach: Status File + Log Per Agent

After considering tmux sessions and hooks, I recommend a **status file + structured logging** approach. Here's why:

| Approach | Pros | Cons |
|----------|------|------|
| **tmux per agent** | Isolated, easy to kill/restart | Hard to see all at once, session management overhead, doesn't persist state |
| **Hooks/notifications** | Proactive alerts | Can be noisy, requires infrastructure, context switching |
| **Status file + logs** *(Recommended)* | Persistent state, low overhead, review when convenient, works with any shell | Requires discipline to update |

---

## Implementation: Status Board Pattern

### 1. Status Board File

Create `.agent-status.md` (or put it in `docs/agent-status.md`):

```markdown
# Agent Status Board

*Last updated: 2026-03-06 14:30 UTC by Agent-X*

## Active Workstreams

| Workstream | Agent | Status | Started | Last Update | Blocker |
|------------|-------|--------|---------|-------------|---------|
| A - Validation | - | [ ] Available | - | - | - |
| B - Admin Auth | - | [ ] Available | - | - | - |
| C - CSP Headers | - | [IN PROGRESS] | 13:00 | 13:45 | None |
| D - Pooling | - | [ ] Available | - | - | - |
| ... | | | | | |

## Recently Completed

| Workstream | Agent | Merged | Notes |
|------------|-------|--------|-------|
| H - ESLint | - | 13:00 | All tests pass |

## Blocked / Needs Help

| Workstream | Agent | Issue | Help Needed From |
|------------|-------|-------|------------------|
| - | - | - | - |
```

**Rule:** Agents update this file when they:
1. Start a workstream (mark `[IN PROGRESS]`)
2. Hit a blocker (add to "Blocked" section)
3. Complete (move to "Recently Completed", clear after 24h)
4. Make significant progress (update "Last Update" timestamp)

### 2. Per-Agent Log Files

Each agent writes to `logs/workstream-{letter}.log`:

```bash
logs/
├── workstream-a.log    # Input validation agent
├── workstream-b.log    # Admin auth agent
├── workstream-c.log    # CSP headers agent
└── ...
```

**Log format:**
```
[2026-03-06 13:45:12] [INFO] Starting workstream C - Security Headers
[2026-03-06 13:46:30] [INFO] Created src/hooks.server.ts
[2026-03-06 13:50:15] [WARN] CSP blocking inline script in +page.svelte, investigating...
[2026-03-06 14:05:00] [INFO] Fixed by moving script to external file
[2026-03-06 14:30:00] [INFO] Completed, running tests
```

**Viewing logs:**
```bash
# Watch all logs (like tail -f on multiple files)
tail -f logs/*.log

# Watch specific agent
tail -f logs/workstream-c.log

# Check for errors across all
 grep "\[ERROR\]" logs/*.log
```

---

## Notification Strategy: "Pull vs Push"

Instead of hooks (push), use **status polling** (pull):

### Option A: Simple CLI Status Check (Recommended)

Create a script or alias:

```bash
# Add to your .zshrc or .bashrc
alias contour-status='cd /Users/dev/Athenia/projects/contours && cat .agent-status.md'
alias contour-logs='cd /Users/dev/Athenia/projects/contours && tail -20 logs/*.log'
alias contour-errors='cd /Users/dev/Athenia/projects/contours && grep -h "\[ERROR\]\|BLOCKED\|NEEDS HELP" logs/*.log .agent-status.md 2>/dev/null || echo "No errors found"'
```

Then just run `contour-status` when you want to check in.

### Option B: Terminal Window Layout (if you want real-time)

Use **tmux** not per-agent, but for monitoring:

```
+------------------+------------------+
|                  |                  |
|   Agent Logs     |   Git Status     |
|   (tail -f)      |   (watch git     |
|                  |    branch -v)    |
+------------------+------------------+
|                                     |
|        Status Board (cat)           |
|                                     |
+-------------------------------------+
```

Single tmux session, multiple panes for visibility.

### Option C: File Watch Notifications (middle ground)

If you want proactive alerts without complexity:

```bash
# Terminal 1: Watch for status changes
fswatch -o .agent-status.md | while read f; do
  echo "\n=== Agent Status Changed ==="
  cat .agent-status.md
  echo "============================\n"
done
```

Or use `watch` for periodic updates:
```bash
watch -n 30 'cat .agent-status.md'
```

---

## Escalation Protocol

When should an agent ask for help?

### Self-Solve First (5-10 minutes)
- Check logs
- Check if it's a known issue
- Try alternative approach

### Escalate If:
- [ ] Tests fail and cause is unclear after 10 min
- [ ] Merge conflict that seems complex
- [ ] Unclear requirement in todo.md
- [ ] Affects another workstream (shared files)
- [ ] Needs design decision (not just implementation)

### How to Escalate

1. **Update status file:**
   ```markdown
   ## Blocked / Needs Help
   
   | Workstream | Agent | Issue | Help Needed From |
   |------------|-------|-------|------------------|
   | C - CSP | - | Inline script blocked, not sure how to refactor | User decision: allow 'unsafe-inline' or refactor? |
   ```

2. **Add to log:**
   ```
   [2026-03-06 14:30:00] [BLOCKED] CSP blocking inline script in admin/create
   [2026-03-06 14:30:00] [BLOCKED] Tried external file but breaks reactivity
   [2026-03-06 14:30:00] [BLOCKED] Need user decision on approach
   ```

3. **Continue if possible:** Work on another task in same workstream, or pause if fully blocked.

---

## Quick Reference: Commands

```bash
# Setup (one time)
mkdir -p /Users/dev/Athenia/projects/contours/logs

# Check overall status
cat .agent-status.md

# Check recent activity
tail -50 logs/*.log

# Check for blockers
grep -i "blocked\|error\|fail\|help" logs/*.log .agent-status.md

# See what agents are running (branches)
git branch -a | grep workstream

# See recent commits by agents
git log --oneline --all --graph --decorate -20
```

---

## Comparison: Tmux Per Agent vs Status File

### Tmux Per Agent (You asked about)

```bash
# You'd have to manage:
tmux new-session -d -s agent-a
tmux new-session -d -s agent-b
tmux new-session -d -s agent-c
# ... etc

# To check status:
tmux ls
tmux attach -t agent-a  # switch context
tmux capture-pane -t agent-a -p  # get output
```

**Verdict:** More overhead than value for this use case. Good for long-running processes, not for discrete workstreams.

### Status File + Logs (Recommended)

```bash
# Persistent, review anytime
cat .agent-status.md
tail logs/*.log

# No session management
# Works across terminal restarts
# Can grep/search history
```

**Verdict:** Better fit for discrete, async workstreams with merge coordination.

---

## If You Still Want Hooks

If you want proactive notifications, add this to the agent workflow:

```bash
# At the end of each agent task completion:
if [ "$WORKSTREAM_BLOCKED" = true ]; then
  # Write to a "notification" file you can watch
  echo "Workstream $WORKSTREAM_LETTER blocked at $(date)" >> .notifications
  echo "Issue: $BLOCKER_DESC" >> .notifications
  echo "---" >> .notifications
fi
```

Then watch with:
```bash
fswatch -o .notifications | xargs -I{} osascript -e 'display notification "Agent needs help" with title "Contours"'
```

(Or similar for Linux notify-send)

---

*Choose what fits your workflow - the key is consistency and low overhead.*
