import type { IconName } from "@/components/icons";

/**
 * Catalog types for TechShop Pro.
 *
 * Notes:
 * - No checkout/order flow is implemented (contact-only).
 */

/**
 * CategoryId is intentionally a string (not a fixed union) so the admin panel
 * can create new categories without requiring a code change.
 */
export type CategoryId = string;

export type Category = {
  id: CategoryId;
  name: string;
  description: string;
  iconName: IconName;
  /** Lower comes first. Optional; if missing, UI falls back to array order. */
  sortOrder?: number;
};

export type ProductAvailability =
  | "available"
  | "sale"
  | "limited"
  | "contact"
  | "request"
  | "unavailable";

export type Product = {
  id: string;
  name: string;
  categoryId: CategoryId;

  /**
   * Card image shown at the top of the product card.
   * Stored in /public.
   */
  image?: string;

  /** Optional watermark logo (SVG usually) stored in /public/logos. */
  logo?: string;

  /** Display values (no currency math; display-only). */
  priceLabel?: string;
  planLabel?: string;

  /**
   * A short line under the title.
   * Keep this short — it’s used in compact cards.
   */
  shortDescription?: string;

  /** Optional feature bullets (keep it small: 3–5). */
  features?: string[];

  /** Small badge shown on the image (e.g. “Sale”, “Limited”). */
  badge?: string;

  availability: ProductAvailability;
  isActive: boolean;
};

export type Catalog = {
  categories: Category[];
  products: Product[];
};
