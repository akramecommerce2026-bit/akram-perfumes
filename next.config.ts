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
    // Allowed <Image quality> values (hero art is served at 85). Next 16 warns
    // for any quality not listed here.
    qualities: [75, 85],
    // Product images uploaded to Supabase Storage are served from the project's
    // public storage endpoint. They render with `unoptimized` (see
    // `isRemoteImage` / next-image usage) so the browser loads them straight from
    // the Supabase CDN, but this pattern is kept so any optimized use still
    // resolves the host.
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
