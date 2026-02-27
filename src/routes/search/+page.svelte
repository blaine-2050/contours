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
					<a href="/posts/{result.slug}" class="result-title">
						{result.title}
					</a>
					<span class="meta">{formatDateTimeGMT(result.date, result.time)} by {result.author}</span>
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
		padding: 0.6rem 0.75rem;
		font-family: var(--font-body);
		font-size: 1rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg-surface);
		color: var(--text);
		transition: border-color 0.15s;
	}

	.search-form input:focus {
		outline: none;
		border-color: var(--link);
	}

	.search-form button {
		padding: 0.6rem 1.25rem;
		font-family: var(--font-ui);
		font-size: 0.875rem;
		font-weight: 500;
		background: var(--link);
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.15s;
	}

	.search-form button:hover {
		background: var(--link-hover);
	}

	.result-count {
		color: var(--text-muted);
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.results {
		list-style: none;
		padding: 0;
	}

	.results li {
		padding: 1rem 0;
		border-bottom: 1px solid var(--border);
	}

	.result-title {
		font-family: var(--font-ui);
		font-weight: 600;
		text-decoration: none;
	}

	.result-title:hover {
		text-decoration: underline;
		text-decoration-color: var(--link);
	}

	.meta {
		display: block;
		font-size: 0.85rem;
		color: var(--text-muted);
		margin-top: 0.2rem;
	}

	.context {
		margin-top: 0.5rem;
		padding: 0.6rem 0.75rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		font-size: 0.85rem;
		color: var(--text-muted);
		white-space: pre-wrap;
	}
</style>
