<script lang="ts">
	import type { PageData } from './$types';
	import { formatDateTimeGMT } from '$lib/utils/date';
	import { dev } from '$app/environment';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Contours</title>
</svelte:head>

<h1>Posts</h1>

<section>
	{#if data.posts.length === 0}
		<p>No posts yet.</p>
	{:else}
		<ul>
			{#each data.posts as post}
				<li>
					<a href="/posts/{post.slug}" class="post-title">
						{post.title}
					</a>
					<span class="meta">{formatDateTimeGMT(post.date, post.time)} by {post.author}</span>
					{#if post.categories.length > 0}
						<span class="post-categories">
							{#each post.categories as category}
								<a href="/category/{category}" class="category-tag">{category}</a>
							{/each}
						</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>

{#if dev}
	<p class="admin-link">
		<a href="/admin/create">Create Post</a> |
		<a href="/admin/stories">Create Story</a> |
		<a href="/admin/categories">Manage Categories</a>
	</p>
{/if}

<style>
	h1 {
		margin-bottom: 1.5rem;
	}

	ul {
		list-style: none;
		padding: 0;
	}

	li {
		padding: 1rem 0;
		border-bottom: 1px solid var(--border);
	}

	li:first-child {
		padding-top: 0;
	}

	.post-title {
		font-family: var(--font-ui);
		font-weight: 600;
		font-size: 1.125rem;
		text-decoration: none;
	}

	.post-title:hover {
		text-decoration: underline;
		text-decoration-color: var(--link);
	}

	.meta {
		display: block;
		font-size: 0.85rem;
		color: var(--text-muted);
		margin-top: 0.2rem;
	}

	.admin-link {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
		font-family: var(--font-ui);
		font-size: 0.875rem;
	}

	.post-categories {
		display: inline-flex;
		gap: 0.35rem;
		margin-top: 0.4rem;
	}

	.category-tag {
		display: inline-block;
		padding: 0.15rem 0.6rem;
		background: var(--accent-bg);
		border-radius: 9999px;
		font-family: var(--font-ui);
		font-size: 0.7rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		text-decoration: none;
		color: var(--link);
	}

	.category-tag:hover {
		background: var(--link);
		color: white;
	}
</style>
