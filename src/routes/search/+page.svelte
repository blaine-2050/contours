<script lang="ts">
	import type { PageData } from './$types';
	import { formatDateTimeGMT } from '$lib/utils/date';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Search - Contours</title>
</svelte:head>

<h1>Search</h1>

<form method="GET" class="search-form">
	<input
		type="text"
		name="q"
		value={data.query}
		placeholder="Search posts (regex supported)..."
		autofocus
	/>
	<button type="submit">Search</button>
</form>

{#if data.query}
	<p class="result-count">
		{data.results.length} result{data.results.length !== 1 ? 's' : ''} for "{data.query}"
	</p>

	{#if data.results.length > 0}
		<ul class="results">
			{#each data.results as result}
				<li>
					<a href="/posts/{result.slug}">
						<strong>{result.title}</strong>
					</a>
					<span class="meta"> - {formatDateTimeGMT(result.date, result.time)} by {result.author}</span>
					{#if result.matchContext}
						<p class="context">{result.matchContext}</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<style>
	.search-form {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.search-form input {
		flex: 1;
		padding: 0.5rem;
		font-size: 1rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		background: var(--bg);
		color: var(--text);
	}

	.search-form button {
		padding: 0.5rem 1rem;
		background: var(--link);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.search-form button:hover {
		background: var(--link-hover);
	}

	.result-count {
		color: var(--text-muted);
		margin-bottom: 1rem;
	}

	.results {
		list-style: none;
		padding: 0;
	}

	.results li {
		margin: 1rem 0;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border);
	}

	.meta {
		color: var(--text-muted);
	}

	.context {
		margin-top: 0.5rem;
		padding: 0.5rem;
		background: var(--border);
		border-radius: 4px;
		font-size: 0.875rem;
		color: var(--text-muted);
		white-space: pre-wrap;
	}
</style>
