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
		<button type="submit">Add</button>
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

	h2 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
	}

	.add-category form {
		display: flex;
		gap: 0.5rem;
	}

	.add-category input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		background: var(--bg);
		color: var(--text);
	}

	.add-category button {
		padding: 0.5rem 1rem;
		background: var(--link);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.category-list ul {
		list-style: none;
		padding: 0;
	}

	.category-list li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
	}

	.category-name {
		font-weight: bold;
	}

	.category-id {
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.remove-form {
		margin-left: auto;
	}

	.remove-btn {
		padding: 0.25rem 0.5rem;
		background: none;
		color: var(--text-muted);
		border: 1px solid var(--border);
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
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
		background: #ffeeee;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.admin-nav {
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}
</style>
