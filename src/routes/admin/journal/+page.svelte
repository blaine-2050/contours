<script lang="ts">
	import type { Commit, GeneratedPost } from '$lib/server/git-journal';

	// State
	let weekStart = $state(getMonday(new Date()).toISOString().split('T')[0]);
	let isLoading = $state(false);
	let commits: Commit[] = $state([]);
	let generatedPost: GeneratedPost | null = $state(null);
	let error: string | null = $state(null);
	let successMessage: string | null = $state(null);

	// Get Monday of current week
	function getMonday(date: Date): Date {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day + (day === 0 ? -6 : 1);
		return new Date(d.setDate(diff));
	}

	// Calculate week end (Sunday)
	function getWeekEnd(start: string): string {
		const date = new Date(start);
		date.setDate(date.getDate() + 6);
		return date.toISOString().split('T')[0];
	}

	// Fetch commits for the selected week
	async function fetchCommits() {
		error = null;
		successMessage = null;
		isLoading = true;
		generatedPost = null;

		try {
			const weekEnd = getWeekEnd(weekStart);
			const response = await fetch(`/api/journal/commits?since=${weekStart}&until=${weekEnd}`);
			
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to fetch commits');
			}

			const data = await response.json();
			commits = data.commits;
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			isLoading = false;
		}
	}

	// Generate post from commits
	async function generatePost() {
		error = null;
		successMessage = null;
		isLoading = true;

		try {
			const response = await fetch('/api/journal/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ commits, weekStart })
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to generate post');
			}

			const data = await response.json();
			generatedPost = {
				frontmatter: data.frontmatter,
				content: data.content
			};
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			isLoading = false;
		}
	}

	// Create draft post
	async function createDraft() {
		if (!generatedPost) return;

		error = null;
		successMessage = null;
		isLoading = true;

		try {
			const response = await fetch('/api/journal/create-draft', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ post: generatedPost })
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to create draft');
			}

			const data = await response.json();
			successMessage = data.message || 'Draft created successfully';
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			isLoading = false;
		}
	}

	// Format preview of markdown
	function formatPreview(post: GeneratedPost): string {
		const lines = [
			'---',
			`title: ${post.frontmatter.title}`,
			`date: ${post.frontmatter.date}`,
			`author: ${post.frontmatter.author}`,
			`categories: [${post.frontmatter.categories.join(', ')}]`,
			'draft: true',
			'---',
			'',
			post.content
		];
		return lines.join('\n');
	}
</script>

<svelte:head>
	<title>Git Journal - Contours</title>
</svelte:head>

<h1>Git Journal</h1>
<p class="description">Generate blog posts from git commit history.</p>

{#if error}
	<div class="alert error">{error}</div>
{/if}

{#if successMessage}
	<div class="alert success">{successMessage}</div>
{/if}

<div class="section">
	<h2>1. Select Week</h2>
	<div class="form-row">
		<div class="field">
			<label for="weekStart">Week Starting (Monday)</label>
			<input 
				type="date" 
				id="weekStart" 
				bind:value={weekStart}
				disabled={isLoading}
			/>
		</div>
		<button 
			class="btn-primary" 
			onclick={fetchCommits}
			disabled={isLoading}
		>
			{#if isLoading && !generatedPost}Loading...{:else}Fetch Commits{/if}
		</button>
	</div>
	<p class="hint">Fetches commits from {weekStart} to {getWeekEnd(weekStart)}</p>
</div>

{#if commits.length > 0}
	<div class="section">
		<h2>2. Commits Found ({commits.length})</h2>
		<ul class="commit-list">
			{#each commits.slice(0, 10) as commit}
				<li>
					<code class="sha">{commit.sha.slice(0, 7)}</code>
					<span class="message">{commit.message}</span>
					<span class="date">{commit.date}</span>
				</li>
			{/each}
			{#if commits.length > 10}
				<li class="more">...and {commits.length - 10} more</li>
			{/if}
		</ul>
		
		{#if !generatedPost}
			<button 
				class="btn-primary" 
				onclick={generatePost}
				disabled={isLoading}
			>
				{#if isLoading}Generating...{:else}Generate Post{/if}
			</button>
		{/if}
	</div>
{/if}

{#if generatedPost}
	<div class="section">
		<h2>3. Generated Post</h2>
		<div class="preview">
			<pre>{formatPreview(generatedPost)}</pre>
		</div>
		<button 
			class="btn-primary" 
			onclick={createDraft}
			disabled={isLoading}
		>
			{#if isLoading}Creating...{:else}Create Draft{/if}
		</button>
	</div>
{/if}

<style>
	.description {
		color: var(--text-muted);
		margin-bottom: 1.5rem;
	}

	.section {
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--border);
	}

	.section:last-child {
		border-bottom: none;
	}

	.section h2 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
	}

	.form-row {
		display: flex;
		gap: 1rem;
		align-items: flex-end;
	}

	.field {
		flex: 1;
	}

	label {
		display: block;
		margin-bottom: 0.25rem;
		font-family: var(--font-ui);
		font-weight: 600;
		font-size: 0.875rem;
	}

	input[type="date"] {
		width: 100%;
		padding: 0.6rem 0.75rem;
		font-size: 1rem;
		font-family: var(--font-body);
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg-surface);
		color: var(--text);
	}

	input:focus {
		outline: none;
		border-color: var(--link);
	}

	.btn-primary {
		padding: 0.6rem 1.25rem;
		font-family: var(--font-ui);
		font-size: 0.9rem;
		font-weight: 500;
		background: var(--link);
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.15s;
		height: fit-content;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--link-hover);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.hint {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	.alert {
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		font-family: var(--font-ui);
		font-size: 0.875rem;
	}

	.alert.error {
		color: #cc0000;
		background: rgba(204, 0, 0, 0.06);
		border: 1px solid rgba(204, 0, 0, 0.15);
	}

	.alert.success {
		color: #006600;
		background: rgba(0, 102, 0, 0.06);
		border: 1px solid rgba(0, 102, 0, 0.15);
	}

	.commit-list {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem 0;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		max-height: 300px;
		overflow-y: auto;
	}

	.commit-list li {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
		display: flex;
		gap: 0.75rem;
		align-items: center;
		font-size: 0.875rem;
	}

	.commit-list li:last-child {
		border-bottom: none;
	}

	.commit-list li.more {
		color: var(--text-muted);
		font-style: italic;
	}

	.commit-list .sha {
		font-family: monospace;
		font-size: 0.8rem;
		color: var(--text-muted);
		background: var(--bg-body);
		padding: 0.1rem 0.3rem;
		border-radius: 3px;
		flex-shrink: 0;
	}

	.commit-list .message {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.commit-list .date {
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.preview {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 1rem;
		margin-bottom: 1rem;
		max-height: 400px;
		overflow-y: auto;
	}

	.preview pre {
		margin: 0;
		font-family: monospace;
		font-size: 0.875rem;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>
