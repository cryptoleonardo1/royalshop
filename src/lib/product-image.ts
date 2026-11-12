// product_images.path is either a file in /public ("/demo-products/x.webp") or an object in the public
// Storage bucket "product-images" ("makita/dhr243z-1.webp", photos imported from supplier catalogues).
export function productImageUrl(path: string): string {
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
}
