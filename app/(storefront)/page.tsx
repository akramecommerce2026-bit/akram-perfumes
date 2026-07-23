import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { BestSellers } from "@/components/home/BestSellers";
import { SignatureSection } from "@/components/home/SignatureSection";
import { WhyChooseAkram } from "@/components/home/WhyChooseAkram";
import { OurStory } from "@/components/home/OurStory";
import { Testimonials } from "@/components/home/Testimonials";

// ISR, matching the rest of the storefront: flagging a product into a rail from
// the admin appears within 5 minutes even without an explicit revalidate.
export const revalidate = 300;

/**
 * Section order follows the benchmark's flow: establish the brand, reassure,
 * then route the visitor into the catalogue (category, then best sellers) before
 * any storytelling. Everything below the hero reads from the backend.
 *
 * Both product rails own their own fetching, so this file states the page's
 * shape and nothing else.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ShopByCategory />
      <BestSellers />
      <SignatureSection />
      <WhyChooseAkram />
      <OurStory />
      <Testimonials />
    </>
  );
}
