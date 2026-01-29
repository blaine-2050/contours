import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Posts Module', () => {
	const postsDir = path.join(process.cwd(), 'posts');

	it('posts directory exists', () => {
		expect(fs.existsSync(postsDir)).toBe(true);
	});

	it('hello-world post exists', () => {
		const helloWorldPath = path.join(postsDir, 'hello-world.md');
		expect(fs.existsSync(helloWorldPath)).toBe(true);
	});

	it('hello-world post has valid frontmatter', () => {
		const helloWorldPath = path.join(postsDir, 'hello-world.md');
		const content = fs.readFileSync(helloWorldPath, 'utf8');

		expect(content).toContain('---');
		expect(content).toContain('title:');
		expect(content).toContain('date:');
		expect(content).toContain('author:');
	});

	it('posts/images directory exists', () => {
		const imagesDir = path.join(postsDir, 'images');
		expect(fs.existsSync(imagesDir)).toBe(true);
	});
});
