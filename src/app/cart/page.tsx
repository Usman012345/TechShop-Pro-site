import { CartPageClient } from "@/components/cart/CartPageClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function CartPage() {
  return <CartPageClient />;
}
