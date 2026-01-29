import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Post {
	slug: string;
	title: string;
	date: string;
	time?: string; // HH:MM in 24-hour GMT
	author: string;
	categories: string[];
	image?: string;
	content: string;
}

export interface PostMeta {
	slug: string;
	title: string;
	date: string;
	time?: string; // HH:MM in 24-hour GMT
	author: string;
	categories: string[];
	image?: string;
}

const postsDirectory = path.join(process.cwd(), 'posts');

function parseCategories(data: Record<string, unknown>): string[] {
	if (!data.categories) return [];
	if (Array.isArray(data.categories)) return data.categories.map(String);
	if (typeof data.categories === 'string') {
		return data.categories.split(',').map((c) => c.trim()).filter(Boolean);
	}
	return [];
}

function parseDate(value: unknown): string {
	if (!value) return new Date().toISOString().split('T')[0];
	if (value instanceof Date) {
		// Format as YYYY-MM-DD in UTC
		return value.toISOString().split('T')[0];
	}
	// Already a string like "2026-01-09"
	return String(value);
}

export function getAllPosts(): PostMeta[] {
	if (!fs.existsSync(postsDirectory)) {
		return [];
	}

	const files = fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.md'));

	const posts = files.map((filename) => {
		const slug = filename.replace(/\.md$/, '');
		const filePath = path.join(postsDirectory, filename);
		const fileContents = fs.readFileSync(filePath, 'utf8');
		const { data } = matter(fileContents);

		return {
			slug,
			title: data.title || slug,
			date: parseDate(data.date),
			time: data.time ? String(data.time) : undefined,
			author: data.author || 'Blaine',
			categories: parseCategories(data),
			image: data.image ? String(data.image) : undefined
		};
	});

	// Sort by date and time descending (newest first)
	return posts.sort((a, b) => {
		const dateA = new Date(`${a.date}T${a.time || '00:00'}:00Z`);
		const dateB = new Date(`${b.date}T${b.time || '00:00'}:00Z`);
		return dateB.getTime() - dateA.getTime();
	});
}

export function getPostsByCategory(categoryId: string): PostMeta[] {
	return getAllPosts().filter((post) => post.categories.includes(categoryId));
}

export function getPostBySlug(slug: string): Post | null {
	const filePath = path.join(postsDirectory, `${slug}.md`);

	if (!fs.existsSync(filePath)) {
		return null;
	}

	const fileContents = fs.readFileSync(filePath, 'utf8');
	const { data, content } = matter(fileContents);

	return {
		slug,
		title: data.title || slug,
		date: parseDate(data.date),
		time: data.time ? String(data.time) : undefined,
		author: data.author || 'Blaine',
		categories: parseCategories(data),
		image: data.image ? String(data.image) : undefined,
		content
	};
}

export async function createPost(data: {
	title: string;
	date: string;
	time?: string; // HH:MM in 24-hour GMT
	content: string;
	author?: string;
	categories?: string[];
	image?: string;
}): Promise<string> {
	const slug = data.title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');

	const categoriesLine =
		data.categories && data.categories.length > 0
			? `categories: [${data.categories.join(', ')}]\n`
			: '';

	const timeLine = data.time ? `time: ${data.time}\n` : '';
	const imageLine = data.image ? `image: ${data.image}\n` : '';

	const frontmatter = `---
title: ${data.title}
date: ${data.date}
${timeLine}author: ${data.author || 'Blaine'}
${categoriesLine}${imageLine}---

${data.content}`;

	const filePath = path.join(postsDirectory, `${slug}.md`);
	fs.writeFileSync(filePath, frontmatter);

	return slug;
}

export async function savePostImage(
	file: File,
	slug: string
): Promise<string> {
	const imagesDir = path.join(postsDirectory, 'images');
	if (!fs.existsSync(imagesDir)) {
		fs.mkdirSync(imagesDir, { recursive: true });
	}

	const ext = file.name.split('.').pop() || 'jpg';
	const filename = `${slug}.${ext}`;
	const filePath = path.join(imagesDir, filename);

	const buffer = Buffer.from(await file.arrayBuffer());
	fs.writeFileSync(filePath, buffer);

	return filename;
}

export function deletePostImage(filename: string): boolean {
	const filePath = path.join(postsDirectory, 'images', filename);
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
		return true;
	}
	return false;
}
