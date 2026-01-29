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
					<a href="/posts/{post.slug}">
						<strong>{post.title}</strong>
					</a>
					<span class="meta"> - {formatDateTimeGMT(post.date, post.time)} by {post.author}</span>
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
		margin: 1rem 0;
	}

	.meta {
		color: var(--text-muted);
	}

	.admin-link {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.post-categories {
		margin-left: 0.5rem;
	}

	.category-tag {
		display: inline-block;
		padding: 0.1rem 0.4rem;
		margin-left: 0.25rem;
		background: var(--border);
		border-radius: 3px;
		font-size: 0.75rem;
		text-decoration: none;
		color: var(--text);
	}

	.category-tag:hover {
		background: var(--link);
		color: white;
	}
</style>
