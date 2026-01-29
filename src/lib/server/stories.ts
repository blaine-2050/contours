import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Story {
	slug: string;
	title: string;
	date: string;
	time?: string;
	author: string;
	summary?: string;
	content: string;
}

export interface StoryMeta {
	slug: string;
	title: string;
	date: string;
	time?: string;
	author: string;
	summary?: string;
}

const storiesDirectory = path.join(process.cwd(), 'stories');

function parseDate(value: unknown): string {
	if (!value) return new Date().toISOString().split('T')[0];
	if (value instanceof Date) {
		return value.toISOString().split('T')[0];
	}
	return String(value);
}

export function getAllStories(): StoryMeta[] {
	if (!fs.existsSync(storiesDirectory)) {
		return [];
	}

	const files = fs.readdirSync(storiesDirectory).filter((file) => file.endsWith('.md'));

	const stories = files.map((filename) => {
		const slug = filename.replace(/\.md$/, '');
		const filePath = path.join(storiesDirectory, filename);
		const fileContents = fs.readFileSync(filePath, 'utf8');
		const { data } = matter(fileContents);

		return {
			slug,
			title: data.title || slug,
			date: parseDate(data.date),
			time: data.time ? String(data.time) : undefined,
			author: data.author || 'Blaine',
			summary: data.summary ? String(data.summary) : undefined
		};
	});

	// Sort by date descending (newest first)
	return stories.sort((a, b) => {
		const dateA = new Date(`${a.date}T${a.time || '00:00'}:00Z`);
		const dateB = new Date(`${b.date}T${b.time || '00:00'}:00Z`);
		return dateB.getTime() - dateA.getTime();
	});
}

export function getStoryBySlug(slug: string): Story | null {
	const filePath = path.join(storiesDirectory, `${slug}.md`);

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
		summary: data.summary ? String(data.summary) : undefined,
		content
	};
}

export async function createStory(data: {
	title: string;
	date: string;
	time?: string;
	content: string;
	author?: string;
	summary?: string;
}): Promise<string> {
	if (!fs.existsSync(storiesDirectory)) {
		fs.mkdirSync(storiesDirectory, { recursive: true });
	}

	const slug = data.title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');

	const timeLine = data.time ? `time: ${data.time}\n` : '';
	const summaryLine = data.summary ? `summary: ${data.summary}\n` : '';

	const frontmatter = `---
title: ${data.title}
date: ${data.date}
${timeLine}author: ${data.author || 'Blaine'}
${summaryLine}---

${data.content}`;

	const filePath = path.join(storiesDirectory, `${slug}.md`);
	fs.writeFileSync(filePath, frontmatter);

	return slug;
}
