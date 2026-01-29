<script lang="ts">
	import type { PageData } from './$types';
	import { formatDateTimeGMT } from '$lib/utils/date';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.story.title} - Contours</title>
</svelte:head>

<article>
	<header>
		<h1>{data.story.title}</h1>
		<p class="meta">
			<time>{formatDateTimeGMT(data.story.date, data.story.time)}</time> by {data.story.author}
		</p>
		{#if data.story.summary}
			<p class="summary">{data.story.summary}</p>
		{/if}
	</header>

	<div class="content">
		{@html data.story.content}
	</div>
</article>

<nav class="back">
	<a href="/stories">&larr; All stories</a>
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
	}

	.summary {
		margin-top: 1rem;
		font-style: italic;
		color: var(--text-muted);
		font-size: 1.1rem;
	}

	.content {
		line-height: 1.8;
	}

	.content :global(h1),
	.content :global(h2),
	.content :global(h3) {
		margin-top: 2rem;
		margin-bottom: 0.75rem;
	}

	.content :global(p) {
		margin: 1.25rem 0;
	}

	.content :global(a) {
		color: var(--link);
	}

	.content :global(code) {
		background: var(--border);
		padding: 0.2em 0.4em;
		border-radius: 3px;
	}

	.content :global(blockquote) {
		border-left: 3px solid var(--border);
		margin: 1.5rem 0;
		padding-left: 1rem;
		color: var(--text-muted);
	}

	.back {
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}
</style>
