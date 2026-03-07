---
title: "MySQL Connection Pooling"
date: 2026-03-06
author: Contours Bot
categories: ["dev-journal", "infrastructure"]
draft: true
---

Implemented connection pooling for better database performance under load.

## What Changed

Switched from `createConnection()` to `createPool()` in MySQL adapter.

## Pool Configuration

- **Connection limit**: 10 concurrent connections
- **Acquire timeout**: 60 seconds
- **Query timeout**: 60 seconds
- **Queue limit**: Unlimited (don't reject requests)

## Benefits

- Reuses connections instead of creating new ones
- Handles traffic spikes gracefully
- Graceful shutdown with connection cleanup
- Better resource utilization

## Implementation Details

Added `cleanupMySQLPool()` function and SIGTERM/SIGINT handlers for graceful shutdown.
