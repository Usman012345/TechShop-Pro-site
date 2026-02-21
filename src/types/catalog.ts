import type { IconName } from "@/components/icons";

/**
 * Catalog types for TechShop Pro.
 *
 * Notes:
 * - This project is a demo portfolio build.
 * - No checkout/order flow is implemented (contact-only).
 */

export type CategoryId =
  | "vpn"
  | "security"
  | "office"
  | "creative"
  | "utilities"
  | "data"
  | "writing"
  | "media"
  | "hardware"
  | "specials";

export type Category = {
  id: CategoryId;
  name: string;
  description: string;
  iconName: IconName;
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

  /** Display values (no currency math; demo only). */
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
