/** Single source of truth for Akram Perfumes' business details (footer, contact, account). */

export const BUSINESS = {
  name: "Akram Perfumes",
  addressLines: [
    "First Floor, Plot No.1",
    "Madurai–Natham Road",
    "Ezhil Nagar, Iyer Bungalow",
    "Madurai, Tamil Nadu – 625014",
  ],
  addressOneLine:
    "First Floor, Plot No.1, Madurai–Natham Road, Ezhil Nagar, Iyer Bungalow, Madurai, Tamil Nadu – 625014",
  phone: "09080896020",
  phoneHref: "tel:+919080896020",
  whatsappHref: "https://wa.me/919080896020",
  email: "akramperfumes@gmail.com",
  emailHref: "mailto:akramperfumes@gmail.com",
} as const;

export const SOCIAL_LINKS: readonly { label: string; href: string }[] = [
  { label: "Instagram", href: "https://instagram.com/akramperfumes" },
  { label: "Facebook", href: "https://facebook.com/akramperfumes" },
  { label: "WhatsApp", href: BUSINESS.whatsappHref },
];

export const CONTACT_FAQS: readonly { question: string; answer: string }[] = [
  {
    question: "How long does delivery take?",
    answer:
      "Orders are dispatched within 1–2 business days and typically arrive in 3–7 business days across India, depending on your location.",
  },
  {
    question: "Are your fragrances authentic and long-lasting?",
    answer:
      "Every Akram fragrance is crafted in-house from carefully sourced ingredients. Attars and eaux de parfum are formulated for depth and longevity.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Unopened products can be returned within 7 days of delivery. If a product arrives damaged, contact us and we'll make it right.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Use the order number from your confirmation on our Track Order page to see live shipment status, courier details and estimated delivery.",
  },
  {
    question: "Do you offer cash on delivery?",
    answer:
      "We currently accept secure online payments via Razorpay (UPI, cards, net banking and wallets) at checkout.",
  },
];
