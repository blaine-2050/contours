export interface Post {
	slug: string;
	title: string;
	date: string;
	time?: string; // HH:MM in 24-hour GMT
	author: string;
	categories: string[];
	image?: string;
	technical?: boolean;
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
	technical?: boolean;
}

export interface Category {
	id: string;
	name: string;
}

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

export interface SearchResult extends PostMeta {
	matchContext?: string;
}
