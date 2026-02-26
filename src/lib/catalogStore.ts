import { CATALOG_SEED } from "@/data/catalogSeed";
import type { Catalog } from "@/types/catalog";

/**
 * Published catalog (public storefront).
 *
 * IMPORTANT:
 * - The public site reads from src/data/catalogSeed.ts.
 * - The admin panel edits a *draft* copy stored in MongoDB.
 * - When you click "Save all changes" in admin, the draft is committed to GitHub
 *   by rewriting src/data/catalogSeed.ts, and Vercel redeploys.
 */

function cloneSeed(): Catalog {
  return structuredClone(CATALOG_SEED);
}

export async function getPublishedCatalog(): Promise<Catalog> {
  return cloneSeed();
}

export async function getPublicCatalog(): Promise<Catalog> {
  const c = await getPublishedCatalog();

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
