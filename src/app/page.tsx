import { Hero } from "@/components/Hero";
import { ShopByCategory } from "@/components/ShopByCategory";
import { TrustedSupport } from "@/components/TrustedSupport";
import { ContactSection } from "@/components/ContactSection";
import { getPublicCatalog } from "@/lib/catalogStore";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const catalog = getPublicCatalog();
  return (
    <div className="space-y-12">
      <Hero />
      <ShopByCategory categories={catalog.categories} products={catalog.products} />
      <TrustedSupport />
      <ContactSection />
    </div>
  );
}
