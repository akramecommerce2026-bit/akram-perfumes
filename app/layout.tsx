import type { Metadata } from "next";
import { Inter, Playfair_Display, Urbanist } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

/**
 * The storefront's typeface. Loaded here (fonts must be module-scope) but only
 * bound to `--font-sans`/`--font-heading` inside `.storefront-theme`, so the
 * admin keeps Inter + Playfair exactly as it is.
 */
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://akramperfumes.com";
const SITE_DESCRIPTION =
  "Discover Akram Perfumes — handcrafted attars, eaux de parfum, incense and solid perfumes, made in Madurai. Secure checkout and fast delivery across India.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Akram Perfumes — Luxury Attars & Perfumes",
  description: SITE_DESCRIPTION,
  applicationName: "Akram Perfumes",
  keywords: ["Akram Perfumes", "attar", "perfume", "oud", "fragrance", "eau de parfum", "Madurai"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Akram Perfumes",
    title: "Akram Perfumes — Luxury Attars & Perfumes",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Akram Perfumes — Luxury Attars & Perfumes",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} ${urbanist.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
