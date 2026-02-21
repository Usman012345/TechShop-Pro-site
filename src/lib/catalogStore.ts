import { CATALOG_SEED } from "@/data/catalogSeed";
import type { Catalog, Category, CategoryId, Product } from "@/types/catalog";

/**
 * In-memory catalog store.
 *
 * Why in-memory?
 * - This repo is a demo storefront meant for free deployment.
 * - It runs without requiring a database account.
 * - On Vercel (serverless), memory reminds you that persistence should be added
 *   via a DB (Supabase/Turso/etc.) for real use.
 */

let _catalog: Catalog | null = null;

function cloneSeed(): Catalog {
  // Node 18+ supports structuredClone.
  return structuredClone(CATALOG_SEED);
}

export function getCatalog(): Catalog {
  if (!_catalog) _catalog = cloneSeed();
  return _catalog;
}

export function resetCatalogToSeed() {
  _catalog = cloneSeed();
}

export function setCatalog(next: Catalog) {
  // Basic guardrails — keep categories/products arrays.
  _catalog = {
    categories: Array.isArray(next.categories) ? next.categories : [],
    products: Array.isArray(next.products) ? next.products : [],
  };
}

export function getPublicCatalog(): Catalog {
  const c = getCatalog();
  return {
    categories: c.categories,
    products: c.products.filter((p) => p.isActive),
  };
}

export function upsertCategory(input: Category) {
  const c = getCatalog();
  const idx = c.categories.findIndex((x) => x.id === input.id);
  if (idx >= 0) c.categories[idx] = input;
  else c.categories.push(input);
}

export function deleteCategory(id: CategoryId) {
  const c = getCatalog();
  c.categories = c.categories.filter((x) => x.id !== id);
  // Orphan products become inactive (safety).
  c.products = c.products.map((p) =>
    p.categoryId === id ? { ...p, isActive: false } : p
  );
}

export function upsertProduct(input: Product) {
  const c = getCatalog();
  const idx = c.products.findIndex((x) => x.id === input.id);
  if (idx >= 0) c.products[idx] = input;
  else c.products.push(input);
}

export function patchProduct(id: string, patch: Partial<Product>) {
  const c = getCatalog();
  const idx = c.products.findIndex((x) => x.id === id);
  if (idx < 0) throw new Error("Product not found");
  c.products[idx] = { ...c.products[idx], ...patch };
  return c.products[idx];
}

export function deleteProduct(id: string) {
  const c = getCatalog();
  c.products = c.products.filter((x) => x.id !== id);
}
