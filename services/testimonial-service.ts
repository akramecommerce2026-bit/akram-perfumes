import { testimonialRecords } from "@/lib/testimonials";
import type { Testimonial } from "@/types/testimonial";

/**
 * Testimonial read layer.
 *
 * UI fetches testimonials through this async service (mirroring how a Supabase
 * query will behave) rather than importing mock data, so the data source can be
 * swapped later without touching any component.
 */
export function getTestimonials(): Promise<readonly Testimonial[]> {
  return Promise.resolve(testimonialRecords);
}
