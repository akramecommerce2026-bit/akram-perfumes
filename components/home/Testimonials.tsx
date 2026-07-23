import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { paperTexture } from "@/components/common/section-paper";
import { TestimonialsBackdrop } from "@/components/home/TestimonialsBackdrop";
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
    <Section
      spacing="lg"
      style={{ backgroundImage: paperTexture(0.02) }}
      // `isolate` makes this a stacking context so the backdrop's -z-10 layers
      // sit behind the content instead of behind the section's own background.
      className="relative isolate overflow-hidden"
    >
      <TestimonialsBackdrop />

      <SectionHeading
        eyebrow="Testimonials"
        title="Loved by Fragrance Enthusiasts"
        subtitle="Discover why our customers keep coming back."
      />

      <TestimonialsCarousel testimonials={testimonials} className="mt-12 lg:mt-16" />
    </Section>
  );
}
