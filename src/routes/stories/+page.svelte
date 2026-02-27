<script lang="ts">
	import type { PageData } from './$types';
	import { formatDateTimeGMT } from '$lib/utils/date';
	import { dev } from '$app/environment';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Stories - Contours</title>
</svelte:head>

<h1>Stories</h1>

<p class="intro">Long-form writing that explores broader themes and connects multiple posts.</p>

<section>
	{#if data.stories.length === 0}
		<p class="empty">No stories yet.</p>
	{:else}
		<ul>
			{#each data.stories as story}
				<li>
					<a href="/stories/{story.slug}" class="story-title">
						{story.title}
					</a>
					<span class="meta">{formatDateTimeGMT(story.date, story.time)} by {story.author}</span>
					{#if story.summary}
						<p class="summary">{story.summary}</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>

{#if dev}
	<p class="admin-link">
		<a href="/admin/stories">Create Story</a>
	</p>
{/if}

<style>
	.intro {
		color: var(--text-muted);
		margin-bottom: 1.5rem;
		font-style: italic;
	}

	ul {
		list-style: none;
		padding: 0;
	}

	li {
		padding: 1.25rem 0;
		border-bottom: 1px solid var(--border);
	}

	li:first-child {
		padding-top: 0;
	}

	.story-title {
		font-family: var(--font-ui);
		font-weight: 600;
		font-size: 1.125rem;
		text-decoration: none;
	}

	.story-title:hover {
		text-decoration: underline;
		text-decoration-color: var(--link);
	}

	.meta {
		display: block;
		font-size: 0.85rem;
		color: var(--text-muted);
		margin-top: 0.2rem;
	}

	.summary {
		margin-top: 0.5rem;
		color: var(--text-muted);
		font-style: italic;
		font-size: 0.95rem;
	}

	.empty {
		color: var(--text-muted);
	}

	.admin-link {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
		font-family: var(--font-ui);
		font-size: 0.875rem;
	}
</style>
