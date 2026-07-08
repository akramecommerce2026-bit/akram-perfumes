import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { getTestimonials } from "@/services/testimonial-service";

/**
 * Server component: fetches testimonials through the service layer (Supabase
 * later) and hands them to the client carousel as props, keeping the UI fully
 * decoupled from the data source.
 */
export async function Testimonials() {
  const testimonials = await getTestimonials();

  return (
    <Section spacing="lg" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_45%,color-mix(in_oklab,var(--accent)_10%,transparent),transparent_70%)]"
      />

      <SectionHeading
        eyebrow="Testimonials"
        title="Loved by Fragrance Enthusiasts"
        subtitle="Discover why our customers keep coming back."
      />

      <TestimonialsCarousel testimonials={testimonials} className="mt-12 lg:mt-16" />
    </Section>
  );
}
