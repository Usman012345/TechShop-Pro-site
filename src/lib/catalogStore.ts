import { CATALOG_SEED } from "@/data/catalogSeed";
import type { Catalog, Category, CategoryId, Product } from "@/types/catalog";

/**
 * Catalog storage layer.
 *
 * Goals:
 * - Works locally out-of-the-box (in-memory fallback).
 * - Can be made persistent on Vercel Free Tier using a connectionless REST KV
 *   (Vercel KV or Upstash Redis REST).
 *
 * To enable persistence in production, set ONE of the following env sets:
 *
 * Vercel KV:
 *   - KV_REST_API_URL
 *   - KV_REST_API_TOKEN
 *
 * Upstash Redis REST:
 *   - UPSTASH_REDIS_REST_URL
 *   - UPSTASH_REDIS_REST_TOKEN
 *
 * Optional:
 *   - TECHSHOP_CATALOG_KEY (default: "techshoppro:catalog:v1")
 */

const DEFAULT_KEY = "techshoppro:catalog:v1";

function cloneSeed(): Catalog {
  // Node 18+ supports structuredClone.
  return structuredClone(CATALOG_SEED);
}

function getKvConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  const key = process.env.TECHSHOP_CATALOG_KEY ?? DEFAULT_KEY;
  const enabled = Boolean(url && token);
  return { enabled, url: url ?? "", token: token ?? "", key };
}

async function kvFetch(path: string, init?: RequestInit) {
  const cfg = getKvConfig();
  if (!cfg.enabled) {
    throw new Error("KV storage is not configured");
  }
  const base = cfg.url.replace(/\/$/, "");
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      ...(init?.headers ?? {}),
    },
    // Avoid Next.js caching for mutation calls.
    cache: "no-store",
  });

  // Upstash/Vercel KV returns JSON like { result: ... } or { error: ... }.
  const data = (await res.json().catch(() => null)) as
    | { result?: unknown; error?: string }
    | null;

  if (!res.ok || data?.error) {
    const msg = data?.error || `KV request failed (${res.status})`;
    throw new Error(msg);
  }
  return data?.result;
}

// ---------------------------
// In-memory fallback
// ---------------------------

let _memoryCatalog: Catalog | null = null;

async function memoryGet(): Promise<Catalog> {
  if (!_memoryCatalog) _memoryCatalog = cloneSeed();
  return _memoryCatalog;
}

async function memorySet(next: Catalog): Promise<void> {
  _memoryCatalog = {
    categories: Array.isArray(next.categories) ? next.categories : [],
    products: Array.isArray(next.products) ? next.products : [],
  };
}

// ---------------------------
// Public API
// ---------------------------

export async function isPersistentStorageEnabled() {
  return getKvConfig().enabled;
}

export async function getCatalog(): Promise<Catalog> {
  const cfg = getKvConfig();
  if (!cfg.enabled) return memoryGet();

  const raw = (await kvFetch(`/get/${encodeURIComponent(cfg.key)}`)) as string | null;
  if (!raw) {
    const seed = cloneSeed();
    await setCatalog(seed);
    return seed;
  }
  try {
    return JSON.parse(raw) as Catalog;
  } catch {
    // If the stored value is corrupted, reset to seed.
    const seed = cloneSeed();
    await setCatalog(seed);
    return seed;
  }
}

export async function setCatalog(next: Catalog): Promise<void> {
  const cfg = getKvConfig();
  const safe: Catalog = {
    categories: Array.isArray(next.categories) ? next.categories : [],
    products: Array.isArray(next.products) ? next.products : [],
  };

  if (!cfg.enabled) return memorySet(safe);

  // For JSON/binary values, Upstash recommends POST with value in request body.
  // Docs: REST_URL/set/<key> with POST body appended as value.
  // This avoids URL-length limits for large catalogs.
  await kvFetch(`/set/${encodeURIComponent(cfg.key)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(safe),
  });
}

export async function resetCatalogToSeed(): Promise<void> {
  await setCatalog(cloneSeed());
}

export async function getPublicCatalog(): Promise<Catalog> {
  const c = await getCatalog();
  const categoriesSorted = [...c.categories].sort((a, b) => {
    const ao = typeof a.sortOrder === "number" ? a.sortOrder : 1e9;
    const bo = typeof b.sortOrder === "number" ? b.sortOrder : 1e9;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name);
  });
  return {
    categories: categoriesSorted,
    products: c.products.filter((p) => p.isActive),
  };
}

// ---------------------------
// Categories
// ---------------------------

export async function upsertCategory(input: Category): Promise<void> {
  const c = await getCatalog();
  const idx = c.categories.findIndex((x) => x.id === input.id);
  if (idx >= 0) c.categories[idx] = input;
  else c.categories.push(input);
  await setCatalog(c);
}

export async function patchCategory(id: CategoryId, patch: Partial<Category>): Promise<Category> {
  const c = await getCatalog();
  const idx = c.categories.findIndex((x) => x.id === id);
  if (idx < 0) throw new Error("Category not found");
  c.categories[idx] = { ...c.categories[idx], ...patch };
  await setCatalog(c);
  return c.categories[idx];
}

export async function deleteCategory(id: CategoryId): Promise<void> {
  const c = await getCatalog();
  c.categories = c.categories.filter((x) => x.id !== id);

  // Orphan products become inactive (safety).
  c.products = c.products.map((p) => (p.categoryId === id ? { ...p, isActive: false } : p));
  await setCatalog(c);
}

// ---------------------------
// Products
// ---------------------------

export async function upsertProduct(input: Product): Promise<void> {
  const c = await getCatalog();
  const idx = c.products.findIndex((x) => x.id === input.id);
  if (idx >= 0) c.products[idx] = input;
  else c.products.push(input);
  await setCatalog(c);
}

export async function patchProduct(id: string, patch: Partial<Product>): Promise<Product> {
  const c = await getCatalog();
  const idx = c.products.findIndex((x) => x.id === id);
  if (idx < 0) throw new Error("Product not found");
  c.products[idx] = { ...c.products[idx], ...patch };
  await setCatalog(c);
  return c.products[idx];
}

export async function deleteProduct(id: string): Promise<void> {
  const c = await getCatalog();
  c.products = c.products.filter((x) => x.id !== id);
  await setCatalog(c);
}
