<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';

	let { children } = $props();

	let theme = $state<'light' | 'dark'>('light');

	// Load theme from localStorage on mount
	$effect(() => {
		if (browser) {
			const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
			if (saved) {
				theme = saved;
			} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				theme = 'dark';
			}
		}
	});

	// Save theme to localStorage when it changes
	$effect(() => {
		if (browser) {
			localStorage.setItem('theme', theme);
			document.documentElement.setAttribute('data-theme', theme);
		}
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app" data-theme={theme}>
	<header>
		<nav class="site-nav">
			<a href="/" class="site-title">Contours</a>
			<div class="nav-right">
				<a href="/stories">Stories</a>
				<a href="/search">Search</a>
				<a href="/about">About</a>
				<button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
					{theme === 'light' ? '🌙' : '☀️'}
				</button>
			</div>
		</nav>
	</header>

	<main>
		{@render children()}
	</main>
</div>

<style>
	:global(:root) {
		--bg: #ffffff;
		--text: #222222;
		--text-muted: #666666;
		--border: #cccccc;
		--link: #0066cc;
		--link-hover: #004499;
	}

	:global([data-theme='dark']) {
		--bg: #1a1a1a;
		--text: #e0e0e0;
		--text-muted: #999999;
		--border: #444444;
		--link: #66b3ff;
		--link-hover: #99ccff;
	}

	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
		background: var(--bg);
		color: var(--text);
		transition: background 0.2s, color 0.2s;
	}

	:global(a) {
		color: var(--link);
	}

	:global(a:hover) {
		color: var(--link-hover);
	}

	.app {
		min-height: 100vh;
	}

	header {
		border-bottom: 1px solid var(--border);
		padding: 1rem 2rem;
	}

	.site-nav {
		max-width: 800px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.site-title {
		font-size: 1.25rem;
		font-weight: bold;
		text-decoration: none;
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.theme-toggle {
		background: none;
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		font-size: 1rem;
	}

	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}
</style>
