<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Manage Categories - Contours</title>
</svelte:head>

<h1>Manage Categories</h1>

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

<section class="add-category">
	<h2>Add Category</h2>
	<form method="POST" action="?/add">
		<input type="text" name="name" placeholder="Category name" required />
		<button type="submit" class="btn-primary">Add</button>
	</form>
</section>

<section class="category-list">
	<h2>Categories</h2>
	{#if data.categories.length === 0}
		<p class="empty">No categories yet.</p>
	{:else}
		<ul>
			{#each data.categories as category}
				<li>
					<span class="category-name">{category.name}</span>
					<span class="category-id">({category.id})</span>
					<form method="POST" action="?/remove" class="remove-form">
						<input type="hidden" name="id" value={category.id} />
						<button type="submit" class="remove-btn">Remove</button>
					</form>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<nav class="admin-nav">
	<a href="/admin/create">Create Post</a>
</nav>

<style>
	section {
		margin-bottom: 2rem;
	}

	.add-category form {
		display: flex;
		gap: 0.5rem;
	}

	.add-category input {
		flex: 1;
		padding: 0.6rem 0.75rem;
		font-family: var(--font-body);
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg-surface);
		color: var(--text);
		transition: border-color 0.15s;
	}

	.add-category input:focus {
		outline: none;
		border-color: var(--link);
	}

	.btn-primary {
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

	.btn-primary:hover {
		background: var(--link-hover);
	}

	.category-list ul {
		list-style: none;
		padding: 0;
	}

	.category-list li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 0;
		border-bottom: 1px solid var(--border);
	}

	.category-name {
		font-weight: 600;
		font-family: var(--font-ui);
	}

	.category-id {
		color: var(--text-muted);
		font-size: 0.8rem;
	}

	.remove-form {
		margin-left: auto;
	}

	.remove-btn {
		padding: 0.25rem 0.6rem;
		font-family: var(--font-ui);
		font-size: 0.8rem;
		background: none;
		color: var(--text-muted);
		border: 1px solid var(--border);
		border-radius: 6px;
		cursor: pointer;
		transition: color 0.15s, border-color 0.15s;
	}

	.remove-btn:hover {
		color: #cc0000;
		border-color: #cc0000;
	}

	.empty {
		color: var(--text-muted);
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

	.admin-nav {
		padding-top: 1rem;
		border-top: 1px solid var(--border);
		font-family: var(--font-ui);
		font-size: 0.875rem;
	}
</style>
