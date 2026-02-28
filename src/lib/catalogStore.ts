import { CATALOG_SEED } from "@/data/catalogSeed";
import type { Catalog } from "@/types/catalog";
import { getDraftCatalog } from "@/lib/draftCatalogStore";

/**
 * Live catalog (public storefront).
 *
 * For Vercel/serverless deployments we cannot write to repo files at runtime.
 * The live storefront reads the catalog from MongoDB (the same catalog the
 * admin panel edits), so edits are reflected immediately on the website.
 *
 * Fallback: If MongoDB isn't configured/reachable, we fall back to the seed file.
 */

function cloneSeed(): Catalog {
  return structuredClone(CATALOG_SEED);
}

export async function getPublishedCatalog(): Promise<Catalog> {
  try {
    return await getDraftCatalog();
  } catch {
    return cloneSeed();
  }
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
