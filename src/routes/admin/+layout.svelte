<script lang="ts">
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: () => any } = $props();

	function handleLogout() {
		// Submit to logout endpoint
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '/admin/login?/logout';
		document.body.appendChild(form);
		form.submit();
	}
</script>

<div class="admin-layout">
	<nav class="admin-nav">
		<div class="nav-links">
			<a href="/admin/create" class="nav-link">Create Post</a>
			<a href="/admin/categories" class="nav-link">Categories</a>
			<a href="/admin/stories" class="nav-link">Stories</a>
			<a href="/admin/publish" class="nav-link">Publish</a>
		</div>
		{#if data.isProduction}
			<button type="button" class="logout-btn" onclick={handleLogout}>Logout</button>
		{/if}
	</nav>

	<main class="admin-content">
		{@render children()}
	</main>
</div>

<style>
	.admin-layout {
		max-width: 900px;
		margin: 0 auto;
		padding: 1rem;
	}

	.admin-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		margin-bottom: 2rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.nav-links {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.nav-link {
		padding: 0.5rem 0.875rem;
		font-family: var(--font-ui);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text);
		text-decoration: none;
		border-radius: 6px;
		transition: background-color 0.15s;
	}

	.nav-link:hover {
		background: var(--accent-bg);
	}

	.logout-btn {
		padding: 0.5rem 1rem;
		font-family: var(--font-ui);
		font-size: 0.875rem;
		font-weight: 500;
		background: transparent;
		color: var(--text-muted);
		border: 1px solid var(--border);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.logout-btn:hover {
		background: rgba(204, 0, 0, 0.1);
		color: #cc0000;
		border-color: rgba(204, 0, 0, 0.3);
	}

	.admin-content {
		padding: 0 0.5rem;
	}

	@media (max-width: 600px) {
		.admin-nav {
			flex-direction: column;
			align-items: stretch;
		}

		.nav-links {
			justify-content: center;
		}

		.logout-btn {
			width: 100%;
		}
	}
</style>
