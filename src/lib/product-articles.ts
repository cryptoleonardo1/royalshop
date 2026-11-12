// Articles on royalstroje.sk (the rental sister site) that review a product sold here.
// Keyed by product slug; the product page shows a link box for these. Editorial, so it lives in code:
// it survives the catalog seed and the supplier imports.
export interface ProductArticle {
  url: string;
  title: string;
  // shown when the article reviews another set of the same machine (different batteries or case)
  note?: string;
}

const ARTICLES: Record<string, ProductArticle> = {
  "makita-tw001gu201": {
    url: "https://royalstroje.sk/blog/makita-tw001gm201-razovy-utahovak-extremny-vykon",
    title: "Rázový uťahovák Makita s extrémnym výkonom 2050 Nm",
    note: "Recenzia hodnotí ten istý stroj TW001G v sade TW001GM201.",
  },
};

export const productArticle = (slug: string): ProductArticle | null => ARTICLES[slug] ?? null;
