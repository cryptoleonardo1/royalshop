import type { NextConfig } from "next";

// Product photos imported from supplier catalogues live in the public Supabase bucket "product-images".
const storage = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    remotePatterns: storage
      ? [new URL(`${storage.origin}/storage/v1/object/public/product-images/**`)]
      : [],
    // photos never change under the same name: keep the optimized copies for a month
    minimumCacheTTL: 2678400,
    // local Supabase runs on 127.0.0.1
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
  // invoice PDFs are rendered in admin server actions (src/lib/invoices/pdf.ts reads the fonts from disk)
  outputFileTracingIncludes: {
    "/admin/**": ["./src/lib/invoices/fonts/*.ttf"],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      // Tailwind only for global stylesheets: running it on *.module.css (with `as: "*.css"`)
      // turns CSS modules into plain CSS and their class maps come back undefined.
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
        condition: { not: { path: /\.module\.css$/ } },
      },
    },
  },
};

export default nextConfig;
