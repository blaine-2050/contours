<script lang="ts">
	import type { PageData } from './$types';
	import { formatDateTimeGMT } from '$lib/utils/date';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.category.name} - Contours</title>
</svelte:head>

<h1>Category: {data.category.name}</h1>

<section>
	{#if data.posts.length === 0}
		<p class="empty">No posts in this category yet.</p>
	{:else}
		<ul>
			{#each data.posts as post}
				<li>
					<a href="/posts/{post.slug}" class="post-title">
						{post.title}
					</a>
					<span class="meta">{formatDateTimeGMT(post.date, post.time)} by {post.author}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<nav class="back">
	<a href="/">&larr; All posts</a>
</nav>

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

	.empty {
		color: var(--text-muted);
	}

	.back {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
		font-family: var(--font-ui);
		font-size: 0.875rem;
	}
</style>
