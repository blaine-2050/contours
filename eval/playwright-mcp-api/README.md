# Evaluation A: Playwright MCP Consuming Git Journal API

**Date:** 2026-03-06  
**Branch:** `eval/playwright-mcp-api`  
**Objective:** Test Path A (Playwright MCP) consuming the Git Journal API vs direct API calls

## Overview

This evaluation tests whether Playwright MCP (browser navigation) can reliably consume REST APIs compared to direct `fetch()`/`request` calls. The Git Journal API provides three endpoints:

- `GET /api/journal/commits?since=&until=` - Returns commits as JSON
- `POST /api/journal/generate` - Generates blog post from commits
- `POST /api/journal/create-draft` - Saves post to ./posts/

## Test Scenarios

### Scenario 1: Normal Case - Get Commits for Week with Activity

| Approach | Status | Notes |
|----------|--------|-------|
| MCP Navigation | ✅ Works | JSON rendered as `<pre>` element in browser |
| Direct Fetch | ✅ Works | Returns JSON response directly |
| Comparison | ✅ Match | Both return identical data |

**Findings:**
- MCP approach requires navigating to the URL and extracting JSON from the page DOM
- Response is wrapped in `<body><pre>{"commits": [...]}</pre></body>`
- Direct fetch is cleaner for API consumption

### Scenario 2: Edge Case - Week with No Commits

| Approach | Status | Notes |
|----------|--------|-------|
| MCP Navigation | ✅ Works | Returns empty array gracefully |
| Direct Fetch | ✅ Works | Returns empty array gracefully |

**Findings:**
- Both approaches handle empty results correctly
- API returns `{ commits: [], count: 0, since, until }`

### Scenario 3: Edge Case - Invalid Date Format

| Approach | Status | Notes |
|----------|--------|-------|
| MCP Navigation | ✅ Works | Shows HTML error page with 400 status |
| Direct Fetch | ✅ Works | Returns JSON error with 400 status |

**Findings:**
- MCP: Renders SvelteKit error page as HTML (`<h1>400</h1><p>Invalid since date format...</p>`)
- Fetch: Returns `{ message: "Invalid since date format..." }` as JSON
- Fetch provides better programmatic error handling

### Scenario 4: Edge Case - Missing Required Parameters

| Approach | Status | Notes |
|----------|--------|-------|
| MCP Navigation | ✅ Works | Shows 400 error page |
| Direct Fetch | ✅ Works | Returns 400 JSON error |

**Findings:**
- Both approaches correctly identify missing `since` parameter
- Validation error: `"Missing required parameter: since"`

### Scenario 5: Generate Post from Commits

| Approach | Status | Notes |
|----------|--------|-------|
| Direct Fetch | ✅ Works | Returns generated post with frontmatter |

**Note:** POST requests via MCP navigation are not practical (would require form submission or page.evaluate())

**Findings:**
- Generate endpoint creates blog post content from commit array
- Returns: `{ frontmatter, content, preview }`
- Invalid JSON body handled gracefully (400)
- Missing commits array validated (400)
- Invalid weekStart format validated (400)

### Scenario 6: Create Draft via API

| Approach | Status | Notes |
|----------|--------|-------|
| Direct Fetch | ✅ Works | Creates file in ./posts/ directory |

**Findings:**
- Creates markdown file with proper frontmatter
- Returns: `{ success, slug, filepath }`
- File can be cleaned up after test
- Validation for missing post object, frontmatter, etc.

## Comparison: MCP vs Direct API Access

### MCP Navigation Approach

**Pros:**
- Can visually inspect API responses in browser
- Works with accessibility tree (though JSON is just text)
- Tests actual browser rendering of API responses
- Good for testing API documentation/visibility

**Cons:**
- Requires DOM parsing to extract JSON (`<body><pre>...</pre></body>`)
- Slower (browser overhead: navigation, rendering, DOM ready)
- Error responses are HTML pages, not structured JSON
- Not practical for POST/PUT/DELETE (requires complex workarounds)
- Accessibility tree shows JSON as generic text, not structured data

**When to use:**
- Testing API documentation pages
- Verifying JSON is human-readable when rendered
- Testing CORS or browser-specific behavior

### Direct Fetch Approach (Playwright request context)

**Pros:**
- Native JSON parsing
- Direct access to status codes and headers
- Structured error responses (JSON)
- Fast (no browser rendering overhead)
- Natural for POST/PUT/DELETE operations
- Better error messages for debugging

**Cons:**
- Doesn't test browser rendering of responses
- No visual feedback during test execution

**When to use:**
- Standard API testing
- Performance-critical tests
- Testing error conditions and status codes
- POST/PUT/DELETE operations

## Performance Comparison

| Metric | MCP Navigation | Direct Fetch |
|--------|---------------|--------------|
| Response Time | ~50-200ms | ~10-50ms |
| JSON Extraction | DOM parsing | Native |
| Error Handling | HTML parsing | Direct JSON |
| POST Support | Complex | Native |

*Note: Times are approximate and vary based on system load*

## Accessibility Tree Analysis

When navigating to a JSON API endpoint via MCP, the accessibility tree shows:

```
RootWebArea " commits"
  generic: <pre> element containing raw JSON string
```

**Findings:**
- JSON is presented as a single text block
- No semantic structure (not parsed as key-value pairs)
- Not useful for structured data extraction via accessibility
- Standard text extraction methods work better

## Recommendations

### When to use Playwright MCP for APIs

1. **API Documentation Testing** - Verify JSON is human-readable
2. **Browser-Specific Behavior** - Test CORS, cookies, auth headers
3. **Integration Testing** - Test API as part of user workflow
4. **Visual Regression** - Capture screenshots of API error pages

### When to use Direct Fetch

1. **Standard API Testing** - Most reliable and performant
2. **Performance Testing** - Lower overhead
3. **Error Handling Tests** - Better structured error access
4. **CRUD Operations** - Natural fit for POST/PUT/DELETE
5. **Microservice Testing** - Headless API consumption

### Hybrid Approach

For comprehensive API testing, use **both approaches**:
- Use **direct fetch** for the bulk of API testing (speed, reliability)
- Use **MCP navigation** for:
  - Testing API endpoints are accessible via browser
  - Verifying error page rendering
  - Documentation/screenshot generation

## Conclusion

**Can Playwright MCP reliably consume REST APIs?**

✅ **Yes, but with limitations.**

- GET requests work via page navigation and JSON extraction from DOM
- POST/PUT/DELETE are impractical via pure navigation (require `page.evaluate()` or complex workarounds)
- Error handling is inferior (HTML vs JSON)
- Performance is slower due to browser overhead

**Recommendation:**
- Use **Playwright's `request` context** (direct fetch) for primary API testing
- Use **MCP navigation** only when testing browser-specific API behavior or visual aspects

## Files

- `api-consumer.spec.ts` - Test suite for API consumption comparison
- `README.md` - This documentation

## Running the Tests

```bash
# Run all API consumer tests
npx playwright test eval/playwright-mcp-api/api-consumer.spec.ts

# Run with UI for visual inspection
npx playwright test eval/playwright-mcp-api/api-consumer.spec.ts --ui

# Run specific scenario
npx playwright test -g "Scenario 1: Normal case"
```

## References

- Evaluation A in project roadmap
- Git Journal API: `src/routes/api/journal/`
- Types: `src/lib/server/git-journal/types.ts`
