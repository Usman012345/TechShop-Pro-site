import { Hero } from "@/components/Hero";
import { ShopByCategory } from "@/components/ShopByCategory";
import { TrustedSupport } from "@/components/TrustedSupport";
import { ContactSection } from "@/components/ContactSection";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <Hero />
      <ShopByCategory />
      <TrustedSupport />
      <ContactSection />
    </div>
  );
}
