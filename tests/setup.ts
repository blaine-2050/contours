/**
 * Test Setup and Utilities
 *
 * This file provides common utilities for testing the Contours blog.
 */

import fs from 'fs';
import path from 'path';

const postsDir = path.join(process.cwd(), 'posts');

/**
 * Clean up test posts (posts containing 'test' in filename)
 */
export function cleanupTestPosts(): void {
	if (!fs.existsSync(postsDir)) return;

	const files = fs.readdirSync(postsDir);
	for (const file of files) {
		if (file.toLowerCase().includes('test') && file.endsWith('.md')) {
			fs.unlinkSync(path.join(postsDir, file));
		}
	}
}

/**
 * Create a test post for testing purposes
 */
export function createTestPost(
	slug: string,
	title: string,
	content: string,
	date?: string
): string {
	const postDate = date || new Date().toISOString().split('T')[0];
	const frontmatter = `---
title: ${title}
date: ${postDate}
author: Blaine
---

${content}`;

	const filePath = path.join(postsDir, `${slug}.md`);
	fs.writeFileSync(filePath, frontmatter);
	return filePath;
}

/**
 * Delete a test post
 */
export function deleteTestPost(slug: string): boolean {
	const filePath = path.join(postsDir, `${slug}.md`);
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
		return true;
	}
	return false;
}

/**
 * Check if a post exists
 */
export function postExists(slug: string): boolean {
	const filePath = path.join(postsDir, `${slug}.md`);
	return fs.existsSync(filePath);
}

/**
 * Read a post's content
 */
export function readPost(slug: string): string | null {
	const filePath = path.join(postsDir, `${slug}.md`);
	if (!fs.existsSync(filePath)) return null;
	return fs.readFileSync(filePath, 'utf8');
}
