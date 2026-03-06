<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Admin Login - Contours</title>
</svelte:head>

<div class="login-container">
	<h1>Admin Login</h1>

	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}

	<form method="POST">
		<div class="field">
			<label for="password">Password</label>
			<input type="password" id="password" name="password" required autofocus />
		</div>

		<button type="submit" class="btn-primary">Login</button>
	</form>
</div>

<style>
	.login-container {
		max-width: 400px;
		margin: 3rem auto;
		padding: 2rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 8px;
	}

	h1 {
		margin-top: 0;
		margin-bottom: 1.5rem;
		text-align: center;
		font-family: var(--font-heading);
		font-size: 1.75rem;
	}

	.field {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-family: var(--font-ui);
		font-weight: 600;
		font-size: 0.875rem;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		font-size: 1rem;
		font-family: var(--font-body);
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		color: var(--text);
		transition: border-color 0.15s;
	}

	input:focus {
		outline: none;
		border-color: var(--link);
	}

	.btn-primary {
		width: 100%;
		padding: 0.875rem;
		font-family: var(--font-ui);
		font-size: 1rem;
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
		text-align: center;
	}
</style>
