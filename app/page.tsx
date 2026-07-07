import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturedCollections />
    </>
  );
}
