<script lang="ts">
	import type { PageData } from './$types';
	import { formatDateTimeGMT } from '$lib/utils/date';
	import { browser } from '$app/environment';

	let { data }: { data: PageData } = $props();

	let showTechnical = $state(false);

	$effect(() => {
		if (browser) {
			const saved = localStorage.getItem('showTechnical');
			if (saved === 'true') showTechnical = true;
		}
	});

	$effect(() => {
		if (browser) {
			localStorage.setItem('showTechnical', String(showTechnical));
		}
	});

	let visiblePosts = $derived(
		showTechnical ? data.posts : data.posts.filter(p => !p.technical)
	);
</script>

<svelte:head>
	<title>{data.category.name} - Contours</title>
</svelte:head>

<h1>Category: {data.category.name}</h1>

<div class="filter-bar">
	<label class="technical-toggle">
		<input type="checkbox" bind:checked={showTechnical} />
		Show technical posts
	</label>
</div>

<section>
	{#if visiblePosts.length === 0}
		<p class="empty">No posts in this category yet.</p>
	{:else}
		<ul>
			{#each visiblePosts as post}
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

	.filter-bar {
		margin-bottom: 1.5rem;
	}

	.technical-toggle {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--text-muted);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.technical-toggle input {
		cursor: pointer;
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
