<script lang="ts">
	import type { PageData } from './$types';
	import { formatDateTimeGMT } from '$lib/utils/date';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.post.title} - Contours</title>
</svelte:head>

<article>
	<header>
		<h1>{data.post.title}</h1>
		<p class="meta">
			<time>{formatDateTimeGMT(data.post.date, data.post.time)}</time> by {data.post.author}
		</p>
		{#if data.post.categories.length > 0}
			<p class="categories">
				{#each data.post.categories as category}
					<a href="/category/{category}" class="category-tag">{category}</a>
				{/each}
			</p>
		{/if}
	</header>

	{#if data.post.image}
		<figure class="post-image">
			<img src="/images/{data.post.image}" alt={data.post.title} />
		</figure>
	{/if}

	<div class="content">
		{@html data.post.content}
	</div>
</article>

<nav class="back">
	<a href="/">&larr; All posts</a>
</nav>

<style>
	header {
		margin-bottom: 2rem;
	}

	h1 {
		margin-bottom: 0.5rem;
	}

	.meta {
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.categories {
		margin-top: 0.75rem;
		display: flex;
		gap: 0.35rem;
		flex-wrap: wrap;
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

	.content {
		line-height: 1.7;
	}

	.content :global(h1),
	.content :global(h2),
	.content :global(h3) {
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.content :global(p) {
		margin: 1rem 0;
	}

	.post-image {
		margin: 0 0 2rem 0;
	}

	.post-image img {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
	}

	.back {
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
		font-family: var(--font-ui);
		font-size: 0.875rem;
	}
</style>
