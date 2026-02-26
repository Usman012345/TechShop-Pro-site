import { CATALOG_SEED } from "@/data/catalogSeed";
import type { Catalog, Category, CategoryId, Product } from "@/types/catalog";
import { getMongoDb, isMongoConfigured } from "@/lib/mongodb";

/**
 * Draft catalog storage.
 *
 * - Stored in MongoDB (required for Vercel/serverless persistence).
 * - Used by the admin panel for CRUD.
 * - The public website uses the *published* catalog from src/data/catalogSeed.ts
 *   (updated via the "Publish" action that commits to GitHub and triggers Vercel redeploy).
 */

type CatalogDoc = {
  _id: string;
  categories: Category[];
  products: Product[];
  createdAt: Date;
  updatedAt: Date;
};

const DRAFT_ID = "draft:v1";
const COLLECTION = "catalog_drafts";

declare global {
  // eslint-disable-next-line no-var
  var _techshopDraftCatalogMemory: Catalog | undefined;
}

function clonePublished(): Catalog {
  return structuredClone(CATALOG_SEED);
}

function getMemoryDraft(): Catalog {
  if (!globalThis._techshopDraftCatalogMemory) {
    globalThis._techshopDraftCatalogMemory = clonePublished();
  }
  return structuredClone(globalThis._techshopDraftCatalogMemory);
}

function setMemoryDraft(next: Catalog) {
  globalThis._techshopDraftCatalogMemory = structuredClone(next);
}

function normalizeCatalog(next: Catalog): Catalog {
  return {
    categories: Array.isArray(next.categories) ? next.categories : [],
    products: Array.isArray(next.products) ? next.products : [],
  };
}

async function getCollection() {
  const db = await getMongoDb();
  return db.collection<CatalogDoc>(COLLECTION);
}

export async function isDraftStorageEnabled() {
  if (!isMongoConfigured()) return false;
  try {
    const db = await getMongoDb();
    // Lightweight connectivity check.
    await db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

export async function getDraftCatalog(): Promise<Catalog> {
  // If MongoDB isn't configured/reachable, fall back to an in-memory draft.
  // This keeps local development usable even before MongoDB is set up.
  if (!isMongoConfigured()) {
    return getMemoryDraft();
  }

  try {
    const col = await getCollection();
    const doc = await col.findOne({ _id: DRAFT_ID });
    if (!doc) {
      const seed = clonePublished();
      await setDraftCatalog(seed);
      return seed;
    }
    return normalizeCatalog({ categories: doc.categories, products: doc.products });
  } catch {
    return getMemoryDraft();
  }
}

export async function setDraftCatalog(next: Catalog): Promise<void> {
  const safe = normalizeCatalog(next);

  // Always keep memory in sync as a fallback (useful in dev and as a safety net).
  setMemoryDraft(safe);

  if (!isMongoConfigured()) return;

  try {
    const col = await getCollection();
    const now = new Date();
    await col.updateOne(
      { _id: DRAFT_ID },
      {
        $set: {
          categories: safe.categories,
          products: safe.products,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );
  } catch {
    // Ignore — memory mode will still work.
  }
}

export async function resetDraftToPublished(): Promise<void> {
  await setDraftCatalog(clonePublished());
}

// ---------------------------
// Categories
// ---------------------------

export async function upsertDraftCategory(input: Category): Promise<void> {
  const c = await getDraftCatalog();
  const idx = c.categories.findIndex((x) => x.id === input.id);
  if (idx >= 0) c.categories[idx] = input;
  else c.categories.push(input);
  await setDraftCatalog(c);
}

export async function patchDraftCategory(id: CategoryId, patch: Partial<Category>): Promise<Category> {
  const c = await getDraftCatalog();
  const idx = c.categories.findIndex((x) => x.id === id);
  if (idx < 0) throw new Error("Category not found");
  c.categories[idx] = { ...c.categories[idx], ...patch };
  await setDraftCatalog(c);
  return c.categories[idx];
}

export async function deleteDraftCategory(id: CategoryId): Promise<void> {
  const c = await getDraftCatalog();
  c.categories = c.categories.filter((x) => x.id !== id);

  // Orphan products become inactive (safety).
  c.products = c.products.map((p) => (p.categoryId === id ? { ...p, isActive: false } : p));
  await setDraftCatalog(c);
}

// ---------------------------
// Products
// ---------------------------

export async function upsertDraftProduct(input: Product): Promise<void> {
  const c = await getDraftCatalog();
  const idx = c.products.findIndex((x) => x.id === input.id);
  if (idx >= 0) c.products[idx] = input;
  else c.products.push(input);
  await setDraftCatalog(c);
}

export async function patchDraftProduct(id: string, patch: Partial<Product>): Promise<Product> {
  const c = await getDraftCatalog();
  const idx = c.products.findIndex((x) => x.id === id);
  if (idx < 0) throw new Error("Product not found");
  c.products[idx] = { ...c.products[idx], ...patch };
  await setDraftCatalog(c);
  return c.products[idx];
}

export async function deleteDraftProduct(id: string): Promise<void> {
  const c = await getDraftCatalog();
  c.products = c.products.filter((x) => x.id !== id);
  await setDraftCatalog(c);
}
