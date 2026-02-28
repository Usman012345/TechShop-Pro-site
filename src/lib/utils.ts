import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPriceRs(priceRs: number | null | undefined) {
  if (priceRs == null) return "Contact";
  try {
    // Keep it simple: PKR formatting without currency symbol assumes "Rs".
    // Always show 2 decimals (e.g., 0.00).
    return `Rs ${priceRs.toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } catch {
    return `Rs ${Number.isFinite(priceRs) ? priceRs.toFixed(2) : priceRs}`;
  }
}

export type Availability = "available" | "on_sale" | "contact";

export function availabilityLabel(a: Availability) {
  switch (a) {
    case "available":
      return "Available";
    case "on_sale":
      return "On Sale";
    case "contact":
      return "Contact";
  }
}

export function availabilityTone(a: Availability) {
  switch (a) {
    case "available":
      return "border-gold/35 bg-gold/10 text-gold2";
    case "on_sale":
      return "border-gold/55 bg-gold/15 text-gold2";
    case "contact":
      return "border-fg/15 bg-fg/5 text-fg/80";
  }
}
