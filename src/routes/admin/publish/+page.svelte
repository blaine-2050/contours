<script lang="ts">
	let { data } = $props();

	interface PublishResults {
		categories: { inserted: number; skipped: number };
		posts: { inserted: number; updated: number; skipped: number };
		stories: { inserted: number; updated: number; skipped: number };
		images: { synced: number };
		errors: string[];
	}

	let publishing = $state(false);
	let results = $state<PublishResults | null>(null);
	let errorMessage = $state<string | null>(null);

	async function publish() {
		publishing = true;
		results = null;
		errorMessage = null;

		try {
			const res = await fetch('/admin/publish', { method: 'POST' });
			if (!res.ok) {
				const body = await res.json().catch(() => null);
				errorMessage = body?.message || `Publish failed (${res.status})`;
				return;
			}
			results = await res.json();
		} catch (err) {
			errorMessage = `Network error: ${String(err)}`;
		} finally {
			publishing = false;
		}
	}
</script>

<svelte:head>
	<title>Publish to Railway - Contours</title>
</svelte:head>

<h1>Publish to Railway</h1>

<p>
	<a href="/admin/create">&larr; Back to admin</a>
</p>

{#if !data.hasDbUrl}
	<div class="warning">
		<strong>RAILWAY_DB_URL not configured.</strong>
		<p>Add <code>RAILWAY_DB_URL</code> to your <code>.env</code> file to enable publishing.</p>
	</div>
{:else}
	<p>Sync local content (posts, stories, categories, images) to the Railway MySQL database.</p>

	<button onclick={publish} disabled={publishing} class="publish-btn">
		{publishing ? 'Publishing...' : 'Publish to Railway'}
	</button>

	{#if errorMessage}
		<div class="error">
			<strong>Error:</strong> {errorMessage}
		</div>
	{/if}

	{#if results}
		<div class="results">
			<h2>Publish Results</h2>

			<table>
				<thead>
					<tr>
						<th>Type</th>
						<th>Inserted</th>
						<th>Updated</th>
						<th>Skipped</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Categories</td>
						<td>{results.categories.inserted}</td>
						<td>—</td>
						<td>{results.categories.skipped}</td>
					</tr>
					<tr>
						<td>Posts</td>
						<td>{results.posts.inserted}</td>
						<td>{results.posts.updated}</td>
						<td>{results.posts.skipped}</td>
					</tr>
					<tr>
						<td>Stories</td>
						<td>{results.stories.inserted}</td>
						<td>{results.stories.updated}</td>
						<td>{results.stories.skipped}</td>
					</tr>
					<tr>
						<td>Images</td>
						<td>{results.images.synced}</td>
						<td>—</td>
						<td>—</td>
					</tr>
				</tbody>
			</table>

			{#if results.errors.length > 0}
				<div class="error">
					<h3>Errors ({results.errors.length})</h3>
					<ul>
						{#each results.errors as err}
							<li>{err}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}
{/if}

<style>
	h1 {
		margin-bottom: 0.5rem;
	}

	.publish-btn {
		background: var(--link);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		font-family: var(--font-ui);
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		margin: 1rem 0;
		transition: background 0.15s;
	}

	.publish-btn:hover:not(:disabled) {
		background: var(--link-hover);
	}

	.publish-btn:disabled {
		opacity: 0.5;
		cursor: wait;
	}

	.warning {
		background: rgba(255, 193, 7, 0.1);
		border: 1px solid rgba(255, 193, 7, 0.3);
		border-radius: 6px;
		padding: 1rem;
		margin: 1rem 0;
		font-family: var(--font-ui);
		font-size: 0.875rem;
	}

	:global([data-theme='dark']) .warning {
		background: rgba(255, 193, 7, 0.08);
		border-color: rgba(255, 193, 7, 0.2);
	}

	.error {
		background: rgba(204, 0, 0, 0.06);
		border: 1px solid rgba(204, 0, 0, 0.15);
		border-radius: 6px;
		padding: 1rem;
		margin: 1rem 0;
		font-family: var(--font-ui);
		font-size: 0.875rem;
	}

	:global([data-theme='dark']) .error {
		background: rgba(204, 0, 0, 0.1);
		border-color: rgba(204, 0, 0, 0.2);
	}

	.results {
		margin-top: 1.5rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin: 1rem 0;
		font-family: var(--font-ui);
		font-size: 0.875rem;
	}

	th,
	td {
		border: 1px solid var(--border);
		padding: 0.5rem 0.75rem;
		text-align: left;
	}

	th {
		background: var(--bg-surface);
		color: var(--text);
		font-weight: 600;
	}

	ul {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}
</style>
