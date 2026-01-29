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
					<a href="/posts/{post.slug}">
						<strong>{post.title}</strong>
					</a>
					<span class="meta"> - {formatDateTimeGMT(post.date, post.time)} by {post.author}</span>
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
		margin: 1rem 0;
	}

	.meta {
		color: var(--text-muted);
	}

	.empty {
		color: var(--text-muted);
	}

	.back {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}
</style>
