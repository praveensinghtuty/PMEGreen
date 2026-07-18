export type CatalogSort =
  "featured" | "name-asc" | "price-asc" | "price-desc" | "newest";

export type CatalogVariant = {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  trackInventory: boolean;
  isDefault: boolean;
  value: number | null;
  unit: string | null;
};

export type CatalogVariantWithProductId = CatalogVariant & {
  productId: string;
};

export type CatalogImage = {
  id: string;
  src: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageSrc: string | null;
};

export type CatalogProductCard = {
  id: string;
  createdAt: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  category: CatalogCategory;
  primaryImage: CatalogImage | null;
  variants: CatalogVariant[];
  startingPrice: number | null;
  variantSummary: string;
  isAvailable: boolean;
};

export type CatalogProductDetail = CatalogProductCard & {
  description: string | null;
  benefits: string | null;
  ingredients: string | null;
  usageInstructions: string | null;
  storageInstructions: string | null;
  shelfLife: string | null;
  images: CatalogImage[];
};

export type CatalogPage = {
  products: CatalogProductCard[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
