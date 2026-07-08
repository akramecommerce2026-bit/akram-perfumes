import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { SignatureSection } from "@/components/home/SignatureSection";
import { WhyChooseAkram } from "@/components/home/WhyChooseAkram";
import { Testimonials } from "@/components/home/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturedCollections />
      <SignatureSection />
      <WhyChooseAkram />
      <Testimonials />
    </>
  );
}
