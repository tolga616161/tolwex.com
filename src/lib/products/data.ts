import productsJson from "@/data/products.json";

export type StaticProduct = {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  badge: string;
  icon: string;
  accent: string;
  accent2: string;
  features: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

const PRODUCTS = productsJson as StaticProduct[];

export function getAllProducts(): StaticProduct[] {
  return PRODUCTS.filter((p) => p.active).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getFeaturedProducts(): StaticProduct[] {
  return getAllProducts().filter((p) => p.featured);
}

export function getProductBySlug(slug: string): StaticProduct | undefined {
  return getAllProducts().find((p) => p.slug === slug);
}
