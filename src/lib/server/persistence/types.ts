import type { Post, PostMeta, Category, Story, StoryMeta, SearchResult } from './models.js';

export interface CreatePostData {
	title: string;
	date: string;
	time?: string;
	content: string;
	author?: string;
	categories?: string[];
	image?: string;
	technical?: boolean;
}

export interface CreateStoryData {
	title: string;
	date: string;
	time?: string;
	content: string;
	author?: string;
	summary?: string;
}

export interface UpdatePostData {
	title: string;
	date: string;
	time?: string;
	content: string;
	author?: string;
	categories?: string[];
	image?: string;
	technical?: boolean;
}

export interface ImageData {
	data: Buffer;
	mimeType: string;
}

export interface PersistenceAdapter {
	// Posts
	getAllPosts(): Promise<PostMeta[]>;
	getPostsByCategory(categoryId: string): Promise<PostMeta[]>;
	getPostBySlug(slug: string): Promise<Post | null>;
	createPost(data: CreatePostData): Promise<string>;
	updatePost(slug: string, data: UpdatePostData): Promise<void>;

	// Images
	savePostImage(file: File, slug: string): Promise<string>;
	deletePostImage(filename: string): Promise<boolean>;
	getImage(filename: string): Promise<ImageData | null>;

	// Categories
	getCategories(): Promise<Category[]>;
	addCategory(name: string): Promise<Category>;
	removeCategory(id: string): Promise<boolean>;

	// Stories
	getAllStories(): Promise<StoryMeta[]>;
	getStoryBySlug(slug: string): Promise<Story | null>;
	createStory(data: CreateStoryData): Promise<string>;

	// Search
	searchPosts(query: string): Promise<SearchResult[]>;
}
