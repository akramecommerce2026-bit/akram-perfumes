import type { MetadataRoute } from "next";

const SITE_URL = "https://akramperfumes.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private / transactional surfaces are never indexed.
        disallow: ["/admin", "/api", "/account", "/checkout", "/track", "/login", "/register", "/forgot-password"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
