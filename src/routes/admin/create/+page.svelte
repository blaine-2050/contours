<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const today = new Date().toISOString().split('T')[0];
	const nowGMT = new Date().toISOString().split('T')[1].substring(0, 5);

	let _imageFile = $state<File | null>(null);
	let imagePreview = $state<string | null>(null);
	let isDragging = $state(false);
	let fileInput: HTMLInputElement;

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files[0];
		if (file && file.type.startsWith('image/')) {
			setImage(file);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			setImage(file);
		}
	}

	function setImage(file: File) {
		_imageFile = file;
		const reader = new FileReader();
		reader.onload = (e) => {
			imagePreview = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	function removeImage() {
		_imageFile = null;
		imagePreview = null;
		if (fileInput) {
			fileInput.value = '';
		}
	}
</script>

<svelte:head>
	<title>Create Post - Contours</title>
</svelte:head>

<h1>Create New Post</h1>

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

<form method="POST" enctype="multipart/form-data">
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

	{#if data.categories.length > 0}
		<fieldset class="field">
			<legend>Categories</legend>
			<div class="categories">
				{#each data.categories as category}
					<label class="category-option">
						<input type="checkbox" name="categories" value={category.id} />
						{category.name}
					</label>
				{/each}
			</div>
			<p class="hint">
				<a href="/admin/categories">Manage categories</a>
			</p>
		</fieldset>
	{:else}
		<div class="field">
			<span class="field-label">Categories</span>
			<p class="hint">
				No categories yet. <a href="/admin/categories">Create one</a>
			</p>
		</div>
	{/if}

	<div class="field">
		<span class="field-label">Image (optional)</span>
		<div
			class="drop-zone"
			class:dragging={isDragging}
			class:has-image={imagePreview}
			ondrop={handleDrop}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
			onclick={() => !imagePreview && fileInput?.click()}
		>
			{#if imagePreview}
				<div class="image-preview">
					<img src={imagePreview} alt="Preview" />
					<button type="button" class="remove-image" onclick={removeImage}>Remove</button>
				</div>
			{:else}
				<p>Drag and drop an image here, or click to select</p>
			{/if}
		</div>
		<input
			bind:this={fileInput}
			type="file"
			name="image"
			accept="image/*"
			onchange={handleFileSelect}
			class="file-input"
		/>
	</div>

	<div class="field">
		<label for="content">Content (Markdown)</label>
		<textarea id="content" name="content" rows="15" required></textarea>
	</div>

	<button type="submit" class="btn-primary">Create Post</button>
</form>

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

	.categories {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.category-option {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-weight: normal;
		cursor: pointer;
	}

	.category-option input {
		width: auto;
	}

	.hint {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	fieldset.field {
		border: none;
		padding: 0;
		margin: 0 0 1rem 0;
	}

	legend {
		display: block;
		margin-bottom: 0.25rem;
		font-family: var(--font-ui);
		font-weight: 600;
		font-size: 0.875rem;
		padding: 0;
	}

	.field-label {
		display: block;
		margin-bottom: 0.25rem;
		font-family: var(--font-ui);
		font-weight: 600;
		font-size: 0.875rem;
	}

	.drop-zone {
		border: 2px dashed var(--border);
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
		cursor: pointer;
		transition:
			border-color 0.2s,
			background-color 0.2s;
	}

	.drop-zone:hover,
	.drop-zone.dragging {
		border-color: var(--link);
		background-color: var(--accent-bg);
	}

	.drop-zone.has-image {
		cursor: default;
		padding: 1rem;
	}

	.drop-zone p {
		margin: 0;
		color: var(--text-muted);
		font-family: var(--font-ui);
		font-size: 0.875rem;
	}

	.image-preview {
		position: relative;
	}

	.image-preview img {
		max-width: 100%;
		max-height: 300px;
		border-radius: 6px;
	}

	.remove-image {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		padding: 0.25rem 0.5rem;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-family: var(--font-ui);
		font-size: 0.8rem;
	}

	.remove-image:hover {
		background: rgba(200, 0, 0, 0.8);
	}

	.file-input {
		display: none;
	}
</style>
