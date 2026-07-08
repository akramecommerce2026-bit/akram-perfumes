import type { Testimonial } from "@/types/testimonial";

/**
 * Temporary mock testimonials.
 *
 * Replaced later by admin-managed rows from Supabase — consumed only through
 * `@/services/testimonial-service`, never imported directly by UI components.
 */
export const testimonialRecords: readonly Testimonial[] = [
  {
    id: "tst_aarav",
    name: "Aarav Sharma",
    rating: 5,
    verified: true,
    product: "Bin Sheikh",
    review:
      "The projection on Bin Sheikh is unreal — I get compliments every single time I wear it. It has quietly become my signature scent.",
    createdAt: "2026-05-18T09:24:00.000Z",
  },
  {
    id: "tst_priya",
    name: "Priya Nair",
    rating: 5,
    verified: true,
    product: "White Oud",
    review:
      "White Oud is refined without ever being overpowering. It lasts my entire workday and still lingers softly into the evening.",
    createdAt: "2026-05-11T14:02:00.000Z",
  },
  {
    id: "tst_rohan",
    name: "Rohan Mehta",
    rating: 5,
    verified: true,
    product: "Royal Attar",
    review:
      "Royal Attar smells like pure luxury. A single drop lasts all day and the oil quality is genuinely exceptional.",
    createdAt: "2026-04-29T18:41:00.000Z",
  },
  {
    id: "tst_sara",
    name: "Sara Khan",
    rating: 4,
    verified: true,
    product: "Bin Sheikh",
    review:
      "Beautifully packaged and wonderfully long-lasting. Akram has quickly become my go-to house for gifting.",
    createdAt: "2026-04-20T11:15:00.000Z",
  },
  {
    id: "tst_vikram",
    name: "Vikram Desai",
    rating: 5,
    verified: true,
    product: "Oud Incense",
    review:
      "The oud incense fills my home with the warmest, most calming aroma. Premium quality from the very first light.",
    createdAt: "2026-04-08T20:07:00.000Z",
  },
  {
    id: "tst_ananya",
    name: "Ananya Iyer",
    rating: 5,
    verified: true,
    product: "Solid Perfume",
    review:
      "I love that I can carry the solid balm everywhere. Discreet, mess-free, and the scent itself is absolutely gorgeous.",
    createdAt: "2026-03-30T07:52:00.000Z",
  },
];
