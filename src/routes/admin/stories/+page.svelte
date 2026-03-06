<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const today = new Date().toISOString().split('T')[0];
	const nowGMT = new Date().toISOString().split('T')[1].substring(0, 5);
</script>

<svelte:head>
	<title>Create Story - Contours</title>
</svelte:head>

<h1>Create New Story</h1>

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

<form method="POST">
	<div class="field">
		<label for="title">Title</label>
		<input type="text" id="title" name="title" required />
	</div>

	<div class="field-row">
		<div class="field">
			<label for="date">Date</label>
			<input type="date" id="date" name="date" value={today} required />
		</div>

		<div class="field">
			<label for="time">Time (GMT, optional)</label>
			<input type="time" id="time" name="time" value={nowGMT} />
		</div>
	</div>

	<div class="field">
		<label for="author">Author</label>
		<input type="text" id="author" name="author" value="Blaine" />
	</div>

	<div class="field">
		<label for="summary">Summary (optional)</label>
		<input type="text" id="summary" name="summary" placeholder="Brief description of the story" />
	</div>

	<div class="field">
		<label for="content">Content (Markdown/HTML)</label>
		<textarea
			id="content"
			name="content"
			rows="20"
			required
			placeholder="Write your story here. You can link to posts using /posts/post-slug format."
		></textarea>
	</div>

	<button type="submit" class="btn-primary">Create Story</button>
</form>

<p class="hint">
	Tip: Link to posts using <code>&lt;a href="/posts/slug"&gt;link text&lt;/a&gt;</code>
</p>

<style>
	.field {
		margin-bottom: 1rem;
	}

	.field-row {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.field-row .field {
		flex: 1;
		margin-bottom: 0;
	}

	label {
		display: block;
		margin-bottom: 0.25rem;
		font-family: var(--font-ui);
		font-weight: 600;
		font-size: 0.875rem;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.6rem 0.75rem;
		font-size: 1rem;
		font-family: var(--font-body);
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg-surface);
		color: var(--text);
		transition: border-color 0.15s;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--link);
	}

	textarea {
		font-family: monospace;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		font-family: var(--font-ui);
		font-size: 0.9rem;
		font-weight: 500;
		background: var(--link);
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-primary:hover {
		background: var(--link-hover);
	}

	.error {
		color: #cc0000;
		padding: 1rem;
		background: rgba(204, 0, 0, 0.06);
		border: 1px solid rgba(204, 0, 0, 0.15);
		border-radius: 6px;
		margin-bottom: 1rem;
		font-family: var(--font-ui);
		font-size: 0.875rem;
	}

	.hint {
		margin-top: 1.5rem;
		color: var(--text-muted);
		font-size: 0.875rem;
	}
</style>
