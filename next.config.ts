import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Product image uploads flow through a Server Action; allow room above the
      // 1 MB default (individual images are capped at 5 MB in the upload helper).
      bodySizeLimit: "6mb",
    },
  },
  images: {
    // Product images uploaded to Supabase Storage are served from the project's
    // public storage endpoint.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
