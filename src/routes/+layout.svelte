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

	<footer>
		<p>&copy; {new Date().getFullYear()} Contours</p>
	</footer>
</div>

<style>
	:global(:root) {
		--font-heading: 'Merriweather', Georgia, serif;
		--font-body: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		--font-ui: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		--bg: #faf8f5;
		--bg-surface: #f3efe9;
		--text: #2d2926;
		--text-muted: #7d7572;
		--border: #e0dbd5;
		--link: #c45d35;
		--link-hover: #a34828;
		--accent-bg: rgba(196, 93, 53, 0.08);
	}

	:global([data-theme='dark']) {
		--bg: #1e1c1a;
		--bg-surface: #2a2725;
		--text: #e8e2da;
		--text-muted: #9d938c;
		--border: #3d3835;
		--link: #e07850;
		--link-hover: #f09070;
		--accent-bg: rgba(224, 120, 80, 0.1);
	}

	:global(body) {
		margin: 0;
		font-family: var(--font-body);
		font-size: 1.0625rem;
		line-height: 1.7;
		background: var(--bg);
		color: var(--text);
		transition: background 0.2s, color 0.2s;
	}

	:global(a) {
		color: var(--link);
		text-decoration: underline;
		text-decoration-color: rgba(196, 93, 53, 0.3);
		text-underline-offset: 2px;
	}

	:global([data-theme='dark'] a) {
		text-decoration-color: rgba(224, 120, 80, 0.3);
	}

	:global(a:hover) {
		color: var(--link-hover);
		text-decoration-color: var(--link-hover);
	}

	/* Heading styles with Merriweather font */
	:global(h1, h2, h3, h4, h5, h6) {
		font-family: var(--font-heading);
		color: var(--text);
		margin-top: 1.5em;
		margin-bottom: 0.75em;
	}

	:global(h1) {
		font-size: 2.5rem;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.02em;
		margin-top: 0;
	}

	:global(h2) {
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1.25;
		letter-spacing: -0.01em;
	}

	:global(h3) {
		font-size: 1.25rem;
		font-weight: 400;
		line-height: 1.3;
	}

	:global(h4) {
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1.3;
	}

	:global(h5, h6) {
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.3;
	}

	/* Indented content sizing - drops one level from parent heading */
	:global(.indented-content) {
		margin-left: 1.5rem;
		padding-left: 1rem;
		border-left: 2px solid var(--border);
	}

	:global(.indented-content p) {
		font-size: 1.25rem;
		line-height: 1.6;
	}

	/* Blockquote styling - enhanced with more indentation */
	:global(blockquote) {
		border-left: 3px solid var(--link);
		background: var(--accent-bg);
		margin: 1.5rem 0;
		padding: 1rem 1.5rem;
		font-style: italic;
		border-radius: 0 8px 8px 0;
	}

	:global(blockquote p:first-child) {
		margin-top: 0;
	}

	:global(blockquote p:last-child) {
		margin-bottom: 0;
	}

	:global(pre) {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 1rem;
		overflow-x: auto;
	}

	:global(code) {
		font-size: 0.9em;
	}

	:global(:not(pre) > code) {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		padding: 0.15em 0.35em;
		border-radius: 4px;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		border-bottom: 1px solid var(--border);
		padding: 1rem 2rem;
	}

	.site-nav {
		max-width: 720px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.site-title {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		text-decoration: none;
		color: var(--text);
		letter-spacing: -0.01em;
	}

	.site-title:hover {
		color: var(--link);
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}

	.nav-right a {
		font-family: var(--font-ui);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-muted);
		text-decoration: none;
		transition: color 0.15s;
	}

	.nav-right a:hover {
		color: var(--link);
	}

	.theme-toggle {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		font-size: 1rem;
		transition: background 0.15s;
	}

	.theme-toggle:hover {
		background: var(--border);
	}

	main {
		max-width: 720px;
		margin: 0 auto;
		padding: 2rem;
		width: 100%;
		box-sizing: border-box;
		flex: 1;
	}

	footer {
		border-top: 1px solid var(--border);
		padding: 1.5rem 2rem;
		text-align: center;
	}

	footer p {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		color: var(--text-muted);
		margin: 0;
	}
</style>
