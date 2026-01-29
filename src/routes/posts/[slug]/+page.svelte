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

<style>
	header {
		margin-bottom: 2rem;
	}

	h1 {
		margin-bottom: 0.5rem;
	}

	.meta {
		color: var(--text-muted);
	}

	.content {
		line-height: 1.6;
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

	.content :global(code) {
		background: var(--border);
		padding: 0.2em 0.4em;
		border-radius: 3px;
	}

	.categories {
		margin-top: 0.5rem;
	}

	.category-tag {
		display: inline-block;
		padding: 0.2rem 0.5rem;
		margin-right: 0.5rem;
		background: var(--border);
		border-radius: 3px;
		font-size: 0.875rem;
		text-decoration: none;
		color: var(--text);
	}

	.category-tag:hover {
		background: var(--link);
		color: white;
	}

	.post-image {
		margin: 0 0 2rem 0;
	}

	.post-image img {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
	}
</style>
