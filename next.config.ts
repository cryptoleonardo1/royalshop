import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
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
