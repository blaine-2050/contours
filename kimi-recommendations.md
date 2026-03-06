# Contours Project Analysis & Recommendations

**Date:** 2026-03-06  
**Project:** Contours - Personal Blog (SvelteKit + TypeScript)  
**Status:** V1 Complete, V1 M2 Deployed to Railway

---

## Executive Summary

Contours is a well-architected personal blog with a clean separation of concerns and a thoughtful persistence abstraction. The codebase demonstrates good TypeScript practices, modular design, and is production-ready with Railway deployment. This document provides recommendations for code quality, security, performance, and future development.

---

## 1. Architecture Assessment

### Strengths

1. **Persistence Abstraction Layer** - Excellent design pattern with `PersistenceAdapter` interface enabling seamless swapping between FileAdapter (dev) and MysqlAdapter (prod)
2. **Clean TypeScript** - Proper type definitions in `models.ts` and `types.ts`
3. **Modular Structure** - Routes organized by feature, server logic separated from UI
4. **Adapter Pattern for Deployment** - `adapter-node` configured correctly for Railway

### Concerns

| Issue | Severity | Details |
|-------|----------|---------|
| No authentication on admin routes | **HIGH** | `/admin/*` routes are unprotected; anyone can create posts in dev mode |
| Database URL in `.env` committed | **MEDIUM** | `RAILWAY_DB_URL` with credentials is in the repo |
| No input sanitization | **MEDIUM** | Post content rendered directly without XSS protection |
| No rate limiting | **MEDIUM** | Admin endpoints vulnerable to abuse |

---

## 2. Security Recommendations

### Immediate Actions Required

```typescript
// 1. Add basic authentication to admin routes
// src/routes/admin/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import { ADMIN_PASSWORD } from '$env/static/private';

export const load = async ({ request, cookies }) => {
    const session = cookies.get('admin_session');
    if (!session || session !== ADMIN_PASSWORD) {
        throw redirect(302, '/admin/login');
    }
};
```

### 2. Move secrets to environment

```bash
# .env.example - add these
ADMIN_PASSWORD=your_secure_password_here
SESSION_SECRET=random_32_char_string
```

### 3. Add Content Security Policy

```typescript
// src/hooks.server.ts
export const handle = async ({ event, resolve }) => {
    const response = await resolve(event);
    response.headers.set('Content-Security-Policy', 
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");
    return response;
};
```

---

## 3. Code Quality Improvements

### A. Error Handling

Current code has inconsistent error handling. Standardize with a pattern:

```typescript
// src/lib/server/errors.ts
export class PersistenceError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'PersistenceError';
    }
}

// Usage in adapters
async getPostBySlug(slug: string): Promise<Post | null> {
    try {
        // ... logic
    } catch (error) {
        logger.error('Failed to get post', { slug, error });
        throw new PersistenceError('Failed to retrieve post', 'GET_POST_FAILED');
    }
}
```

### B. Input Validation

Add Zod schemas for form validation:

```typescript
// src/lib/validation/post.ts
import { z } from 'zod';

export const postSchema = z.object({
    title: z.string().min(1).max(200),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    content: z.string().min(1).max(50000),
    author: z.string().default('Blaine'),
    categories: z.array(z.string()).default([])
});

export type PostInput = z.infer<typeof postSchema>;
```

### C. Database Connection Pooling

Current MySQL adapter creates connections per request. Add pooling:

```typescript
// src/lib/server/persistence/mysql-adapter.ts
import { createPool, type Pool } from 'mysql2/promise';

export class MysqlAdapter implements PersistenceAdapter {
    private pool: Pool;
    
    constructor(url: string) {
        this.pool = createPool({
            uri: url,
            connectionLimit: 10,
            acquireTimeout: 60000,
            timeout: 60000,
        });
    }
}
```

---

## 4. Performance Optimizations

### A. Add Caching Layer

```typescript
// src/lib/server/cache.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

export const cachedGetAllPosts = async (adapter: PersistenceAdapter) => {
    const key = 'all_posts';
    let posts = cache.get<PostMeta[]>(key);
    if (!posts) {
        posts = await adapter.getAllPosts();
        cache.set(key, posts);
    }
    return posts;
};
```

### B. Image Optimization

Currently images served as-is. Add resizing:

```typescript
// src/routes/images/[filename]/+server.ts
import sharp from 'sharp';

// Serve webp versions, resize if query param present
```

### C. Enable Compression

```typescript
// svelte.config.js - add compression middleware
import compression from 'compression';

// In hooks.server.ts
export const handle = sequence(
    async ({ event, resolve }) => {
        // Add compression
    },
    handleSvelteKit
);
```

---

## 5. Testing Improvements

### Current State
- 4 basic unit tests
- Playwright configured but minimal coverage

### Recommended Additions

```typescript
// tests/unit/persistence.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { FileAdapter } from '$lib/server/persistence/file-adapter';

describe('PersistenceAdapter', () => {
    let adapter: FileAdapter;
    
    beforeEach(() => {
        adapter = new FileAdapter();
        // Use temp directory for tests
    });
    
    it('should create and retrieve a post', async () => {
        // Test round-trip
    });
    
    it('should search posts with regex', async () => {
        // Test search functionality
    });
});
```

### E2E Tests to Add

```typescript
// tests/e2e/admin.spec.ts
import { test, expect } from '@playwright/test';

test('admin create post flow', async ({ page }) => {
    await page.goto('/admin/create');
    await page.fill('[name=title]', 'Test Post');
    await page.fill('[name=content]', 'Test content');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/');
});
```

---

## 6. Developer Experience

### Add These Scripts to `package.json`

```json
{
    "scripts": {
        "lint": "eslint src tests --ext .ts,.svelte",
        "lint:fix": "eslint src tests --ext .ts,.svelte --fix",
        "format": "prettier --write src tests",
        "format:check": "prettier --check src tests",
        "typecheck": "svelte-check --tsconfig ./tsconfig.json",
        "test:coverage": "vitest run --coverage"
    }
}
```

### Add ESLint Configuration

```javascript
// eslint.config.js
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';

export default [
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs.recommended,
];
```

---

## 7. V2 M1 Typography Implementation Plan

Based on `todo.md` V2 M1 requirements:

### Font Loading Strategy

```typescript
// src/app.html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Source+Sans+Pro:wght@400;600&display=swap" rel="stylesheet">
```

### CSS Variables Update

```css
/* src/routes/+layout.svelte */
:root {
    --font-heading: 'Merriweather', Georgia, serif;
    --font-body: 'Source Sans Pro', -apple-system, sans-serif;
}
```

---

## 8. Database Schema Recommendations

### Add Timestamps

```typescript
// src/lib/server/persistence/schema.ts
import { timestamp } from 'drizzle-orm/mysql-core';

export const contoursPosts = mysqlTable('contours_posts', {
    // ... existing fields
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
```

### Add Indexes

```typescript
// For better search performance
index('idx_posts_date').on(table.date),
index('idx_posts_slug').on(table.slug),
```

---

## 9. Deployment & Operations

### Health Check Endpoint

```typescript
// src/routes/health/+server.ts
import { json } from '@sveltejs/kit';
import { getAdapter } from '$lib/server/persistence';

export const GET = async () => {
    try {
        const adapter = getAdapter();
        await adapter.getAllPosts(); // Quick DB check
        return json({ status: 'ok', timestamp: new Date().toISOString() });
    } catch (error) {
        return json({ status: 'error' }, { status: 503 });
    }
};
```

### Logging Improvements

Current logger is basic. Add structured logging:

```typescript
// src/lib/server/logger.ts
export const logger = {
    info: (msg: string, meta?: Record<string, unknown>) => {
        console.log(JSON.stringify({ level: 'info', msg, ...meta, timestamp: new Date().toISOString() }));
    },
    error: (msg: string, meta?: Record<string, unknown>) => {
        console.error(JSON.stringify({ level: 'error', msg, ...meta, timestamp: new Date().toISOString() }));
    }
};
```

---

## 10. Priority Action Items

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| P0 | Remove/rotate exposed DB credentials | 5 min | Critical |
| P0 | Add basic auth to admin routes | 2 hrs | High |
| P1 | Add input validation (Zod) | 3 hrs | High |
| P1 | Add CSP headers | 30 min | Medium |
| P2 | Implement connection pooling | 2 hrs | Medium |
| P2 | Add caching layer | 3 hrs | Medium |
| P3 | Add ESLint + Prettier | 1 hr | Low |
| P3 | Expand test coverage | 4 hrs | Medium |

---

## Appendix: File Structure Analysis

```
contours/
├── src/
│   ├── lib/
│   │   ├── server/
│   │   │   ├── persistence/     # Excellent abstraction ✓
│   │   │   │   ├── file-adapter.ts
│   │   │   │   ├── mysql-adapter.ts
│   │   │   │   ├── types.ts     # Clean interfaces ✓
│   │   │   │   └── models.ts    # Well-defined types ✓
│   │   │   └── logger.ts        # Basic, needs improvement
│   │   └── utils/
│   │       └── date.ts          # Good utility isolation ✓
│   └── routes/
│       ├── admin/               # Needs auth protection ⚠️
│       ├── posts/[slug]/        # Clean dynamic routes ✓
│       └── +layout.svelte       # Good theme implementation ✓
├── tests/
│   ├── unit/                    # Minimal coverage ⚠️
│   └── e2e/                     # Needs expansion ⚠️
├── posts/                       # File-based content ✓
└── data/                        # Categories JSON ✓
```

---

*Generated by Kimi Code CLI - Review quarterly or after major releases.*
