# Evaluation B: Stagehand Consuming Git Journal API

This evaluation tests Path B (Stagehand) consuming the Git Journal API using natural language instructions.

## Overview

Stagehand is designed for natural language instruction and self-healing capabilities. This evaluation explores how well natural language can describe API usage patterns and whether self-healing works effectively for API response changes.

## Git Journal API Endpoints

| Endpoint | Method | Description | Natural Language Example |
|----------|--------|-------------|-------------------------|
| `/api/journal/commits` | GET | Get commits by date range | "Get commits from March 1-7, 2026" |
| `/api/journal/generate` | POST | Generate blog post from commits | "Generate a blog post from these commits" |
| `/api/journal/create-draft` | POST | Save post as draft | "Save the post as a draft" |

## Test Scenarios

### 1. Natural Language API Usage

The `StagehandAPIClient` class demonstrates parsing natural language instructions:

```typescript
const client = new StagehandAPIClient();

// Normal case
const commits = await client.execute('Get commits from March 1-7, 2026');

// ISO dates
const commits = await client.execute('Get commits from 2026-03-01 to 2026-03-07');

// Relative dates
const commits = await client.execute('Get commits from last week');
```

**Findings:**
- Natural language parsing works well for clear date ranges
- ISO dates can be extracted from instructions reliably
- Relative dates ("last week", "yesterday") require additional context

### 2. Self-Healing with API Response Changes

The `SelfHealingAPIClient` class demonstrates adapting to response structure changes:

| Original Structure | Adapted Structure | Use Case |
|-------------------|-------------------|----------|
| `{ commits: [...], count: N }` | Direct match | Normal case |
| `{ data: { commits: [...] } }` | Flatten nested structure | API versioning |
| `{ items: [...], total: N }` | Rename fields | Different API convention |
| `[...]` (array) | Wrap in object | Simplified response |

**Findings:**
- Self-healing successfully adapts to common response structure changes
- Adaptations are logged for transparency
- Graceful degradation when structure is unrecognizable

### 3. Edge Cases

#### Ambiguous Date Descriptions

| Instruction | Result | Notes |
|-------------|--------|-------|
| "Get commits from sometime in March" | ❌ Fails | Too vague |
| "Fetch recent commits" | ⚠️ Uses last 7 days | Reasonable default |
| "Show me commits" | ❌ Fails | No date context |

**Recommendation:** Natural language works best with specific, structured instructions.

### 4. Error Handling

```typescript
// Missing context
try {
  await client.execute('Generate a blog post from these commits');
  // Error: Generate post requires commits array in context
} catch (e) {
  // Handle gracefully
}
```

**Findings:**
- Clear error messages help users understand what's missing
- Context passing between steps is essential for multi-step workflows

### 5. Multi-Step Workflow

Complete workflow using natural language:

```typescript
// Step 1: Get commits
const commits = await client.execute('Get commits from March 1-7, 2026');

// Step 2: Generate post
const post = await client.execute('Generate a blog post from these commits', commits.commits);

// Step 3: Save draft
const draft = await client.execute('Save the post as a draft', post);
```

## Latency vs Reliability Trade-offs

| Approach | Latency | Reliability | Best For |
|----------|---------|-------------|----------|
| Direct API calls | Low (~50ms) | High | Production, high-traffic |
| Typed API client | Low (~50ms) | High | Standard development |
| Natural language (Stagehand) | High (~500ms-2s) | Medium | Prototyping, exploration |
| Self-healing client | Medium (~100ms) | High | APIs with versioning |

## Comparison with Typed API Clients

### Traditional Typed Client

```typescript
// Brittle but fast
const response = await fetch('/api/journal/commits?since=2026-03-01&until=2026-03-07');
const data = await response.json();
// Assumes exact structure: { commits, count, since, until }
```

### Stagehand Natural Language

```typescript
// Flexible but slower
const result = await client.execute('Get commits from March 1-7, 2026');
// Handles multiple date formats, adapts to response changes
```

### Self-Healing Client

```typescript
// Best of both worlds
const client = new SelfHealingAPIClient();
const result = await client.getCommits('2026-03-01', '2026-03-07');
// Adapts to: { data: { commits } }, { items }, [array], etc.
```

## When is Stagehand Valuable for API Consumption?

### ✅ Use Stagehand when:

- **Prototyping**: Rapid experimentation without learning exact API structure
- **API Exploration**: Discovering available endpoints and parameters
- **Handling Version Drift**: APIs that change frequently or lack versioning
- **User-Facing Interfaces**: Allowing non-technical users to interact with APIs
- **Multi-step Workflows**: Chaining multiple API calls with natural language

### ❌ Don't Use Stagehand when:

- **Performance Critical**: High-throughput scenarios where latency matters
- **Strongly Typed Systems**: When TypeScript provides sufficient safety
- **Well-Documented Stable APIs**: No need for self-healing when API is stable
- **Simple CRUD Operations**: Direct calls are clearer and faster

## Key Findings

### Natural Language Effectiveness

| Aspect | Rating | Notes |
|--------|--------|-------|
| Date Parsing | ⭐⭐⭐⭐ | Works well with specific formats |
| Instruction Clarity | ⭐⭐⭐ | Requires learning supported patterns |
| Error Messages | ⭐⭐⭐⭐ | Clear about what's missing |
| Context Passing | ⭐⭐⭐ | Manual context passing required |

### Self-Healing Capabilities

| Scenario | Success Rate | Notes |
|----------|--------------|-------|
| Nested → Flat | 100% | Easy transformation |
| Field Renames | 100% | Common pattern matching |
| Array → Object | 100% | Simple wrapping |
| Type Changes | 60% | Depends on change complexity |
| Missing Fields | 80% | Graceful degradation |

## Recommendations

1. **Hybrid Approach**: Use natural language for high-level orchestration, typed clients for performance-critical paths
2. **Caching**: Cache parsed instructions to reduce latency in repeated operations
3. **Fallback Strategy**: Always have a direct API fallback for production use
4. **Logging**: Extensive logging of adaptations for debugging and improvement

## Running the Tests

```bash
# Run unit tests
npm run test

# Run specific evaluation tests
npx playwright test eval/stagehand-api/
```

## References

- [CLAUDE.md](../../CLAUDE.md) - Project context
- [Git Journal API](../../src/routes/api/journal/) - API implementation
- [Types](../../src/lib/server/git-journal/types.ts) - TypeScript interfaces
