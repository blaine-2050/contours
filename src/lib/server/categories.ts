import fs from 'fs';
import path from 'path';

const categoriesFile = path.join(process.cwd(), 'data', 'categories.json');

export interface Category {
	id: string;
	name: string;
}

function ensureDataDir() {
	const dataDir = path.dirname(categoriesFile);
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}
}

export function getCategories(): Category[] {
	ensureDataDir();
	if (!fs.existsSync(categoriesFile)) {
		return [];
	}
	const data = fs.readFileSync(categoriesFile, 'utf8');
	return JSON.parse(data);
}

export function addCategory(name: string): Category {
	const categories = getCategories();
	const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

	// Check if already exists
	if (categories.some(c => c.id === id)) {
		return categories.find(c => c.id === id)!;
	}

	const category: Category = { id, name };
	categories.push(category);

	ensureDataDir();
	fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2));

	return category;
}

export function removeCategory(id: string): boolean {
	const categories = getCategories();
	const filtered = categories.filter(c => c.id !== id);

	if (filtered.length === categories.length) {
		return false;
	}

	ensureDataDir();
	fs.writeFileSync(categoriesFile, JSON.stringify(filtered, null, 2));
	return true;
}
