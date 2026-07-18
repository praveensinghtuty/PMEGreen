import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";
import type {
  CatalogCategory,
  CatalogImage,
  CatalogPage,
  CatalogProductCard,
  CatalogProductDetail,
  CatalogSort,
  CatalogVariant,
  CatalogVariantWithProductId,
} from "@/features/catalog/types/catalog";
import {
  getVariantSummary,
  isVariantAvailable,
} from "@/features/catalog/utils/format";
import { toPublicStorageUrl } from "@/features/catalog/utils/storage";

const PAGE_SIZE = 12;
const MAX_PUBLIC_PRODUCTS = 240;

type CategoryRow = Tables<"categories">;
type ProductRow = Tables<"products">;
type VariantRow = Tables<"product_variants">;
type ImageRow = Tables<"product_images">;

type PublicCategoryRow = Pick<
  CategoryRow,
  "description" | "id" | "image_path" | "name" | "slug"
>;
type PublicProductCardRow = Pick<
  ProductRow,
  "category_id" | "created_at" | "id" | "name" | "short_description" | "slug"
>;
type PublicVariantRow = Pick<
  VariantRow,
  | "compare_at_price"
  | "id"
  | "is_default"
  | "name"
  | "price"
  | "product_id"
  | "stock_quantity"
  | "track_inventory"
  | "unit"
  | "value"
>;
type PublicImageRow = Pick<
  ImageRow,
  | "alt_text"
  | "id"
  | "is_primary"
  | "product_id"
  | "sort_order"
  | "storage_path"
>;

function mapCategory(row: PublicCategoryRow): CatalogCategory {
  return {
    id: row.id,
    description: row.description,
    imageSrc: row.image_path
      ? toPublicStorageUrl("site-assets", row.image_path)
      : null,
    name: row.name,
    slug: row.slug,
  };
}

function mapVariant(row: PublicVariantRow): CatalogVariantWithProductId {
  return {
    id: row.id,
    compareAtPrice: row.compare_at_price,
    isDefault: row.is_default,
    name: row.name,
    price: row.price,
    productId: row.product_id,
    stockQuantity: row.stock_quantity,
    trackInventory: row.track_inventory,
    unit: row.unit,
    value: row.value,
  };
}

function mapImage(row: PublicImageRow, productName: string): CatalogImage {
  return {
    id: row.id,
    alt: row.alt_text ?? productName,
    isPrimary: row.is_primary,
    sortOrder: row.sort_order,
    src: toPublicStorageUrl("product-images", row.storage_path),
  };
}

function getStartingPrice(variants: CatalogVariant[]) {
  if (variants.length === 0) {
    return null;
  }

  return Math.min(...variants.map((variant) => variant.price));
}

function mapProductCard({
  category,
  images,
  product,
  variants,
}: {
  category: CatalogCategory;
  images: CatalogImage[];
  product: PublicProductCardRow;
  variants: CatalogVariant[];
}): CatalogProductCard {
  const sortedVariants = [...variants].sort((a, b) => {
    if (a.isDefault && !b.isDefault) {
      return -1;
    }

    if (!a.isDefault && b.isDefault) {
      return 1;
    }

    return a.price - b.price;
  });
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) {
      return -1;
    }

    if (!a.isPrimary && b.isPrimary) {
      return 1;
    }

    return a.sortOrder - b.sortOrder;
  });

  return {
    id: product.id,
    category,
    createdAt: product.created_at,
    isAvailable: sortedVariants.some(isVariantAvailable),
    name: product.name,
    primaryImage: sortedImages[0] ?? null,
    shortDescription: product.short_description,
    slug: product.slug,
    startingPrice: getStartingPrice(sortedVariants),
    variantSummary: getVariantSummary(sortedVariants),
    variants: sortedVariants,
  };
}

function sortProducts(products: CatalogProductCard[], sort: CatalogSort) {
  return [...products].sort((a, b) => {
    if (sort === "name-asc") {
      return a.name.localeCompare(b.name);
    }

    if (sort === "price-asc") {
      return (
        (a.startingPrice ?? Number.MAX_SAFE_INTEGER) -
        (b.startingPrice ?? Number.MAX_SAFE_INTEGER)
      );
    }

    if (sort === "price-desc") {
      return (b.startingPrice ?? -1) - (a.startingPrice ?? -1);
    }

    if (sort === "newest") {
      return b.createdAt.localeCompare(a.createdAt);
    }

    return (
      Number(b.isAvailable) - Number(a.isAvailable) ||
      a.name.localeCompare(b.name)
    );
  });
}

async function getPublicProductRows({
  categoryId,
  query,
}: {
  categoryId?: string;
  query?: string;
}) {
  const supabase = await createClient();
  let request = supabase
    .from("products")
    .select("category_id, created_at, id, name, short_description, slug")
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(MAX_PUBLIC_PRODUCTS);

  if (categoryId) {
    request = request.eq("category_id", categoryId);
  }

  if (query) {
    request = request.ilike(
      "name",
      `%${query.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`,
    );
  }

  const { data, error } = await request;

  if (error) {
    throw new Error("Unable to load public products");
  }

  return data;
}

async function getActiveCategoriesByIds(ids: string[]) {
  if (ids.length === 0) {
    return new Map<string, CatalogCategory>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("description, id, image_path, name, slug")
    .in("id", ids)
    .eq("is_active", true);

  if (error) {
    throw new Error("Unable to load product categories");
  }

  const categories = data.map(mapCategory);
  return new Map(categories.map((category) => [category.id, category]));
}

async function getActiveVariantsByProductIds(ids: string[]) {
  if (ids.length === 0) {
    return new Map<string, CatalogVariant[]>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      "compare_at_price, id, is_default, name, price, product_id, stock_quantity, track_inventory, unit, value",
    )
    .in("product_id", ids)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error("Unable to load product variants");
  }

  const grouped = new Map<string, CatalogVariant[]>();

  for (const row of data) {
    const variant = mapVariant(row);
    grouped.set(variant.productId, [
      ...(grouped.get(variant.productId) ?? []),
      variant,
    ]);
  }

  return grouped;
}

async function getImagesByProductIds(
  ids: string[],
  productNames: Map<string, string>,
) {
  if (ids.length === 0) {
    return new Map<string, CatalogImage[]>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("alt_text, id, is_primary, product_id, sort_order, storage_path")
    .in("product_id", ids)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error("Unable to load product images");
  }

  const grouped = new Map<string, CatalogImage[]>();

  for (const row of data) {
    const image = mapImage(
      row,
      productNames.get(row.product_id) ?? "Product image",
    );
    grouped.set(row.product_id, [
      ...(grouped.get(row.product_id) ?? []),
      image,
    ]);
  }

  return grouped;
}

export async function getPublicCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("description, id, image_path, name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Unable to load categories");
  }

  return data.map(mapCategory);
}

export async function getPublicCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("description, id, image_path, name, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load category");
  }

  return data ? mapCategory(data) : null;
}

export async function getPublicProductCards({
  categorySlug,
  category,
  page,
  query,
  sort,
}: {
  category?: CatalogCategory;
  categorySlug?: string;
  page: number;
  query?: string;
  sort: CatalogSort;
}): Promise<CatalogPage> {
  const resolvedCategory = categorySlug
    ? await getPublicCategoryBySlug(categorySlug)
    : (category ?? null);

  if ((categorySlug || category) && !resolvedCategory) {
    return { page, pageSize: PAGE_SIZE, products: [], total: 0, totalPages: 0 };
  }

  const productRows = await getPublicProductRows({
    categoryId: resolvedCategory?.id,
    query,
  });
  const productIds = productRows.map((product) => product.id);
  const productNames = new Map(
    productRows.map((product) => [product.id, product.name]),
  );
  const [categories, variants, images] = await Promise.all([
    getActiveCategoriesByIds([
      ...new Set(productRows.map((product) => product.category_id)),
    ]),
    getActiveVariantsByProductIds(productIds),
    getImagesByProductIds(productIds, productNames),
  ]);

  const products = productRows
    .map((product) => {
      const productCategory = categories.get(product.category_id);

      if (!productCategory) {
        return null;
      }

      return mapProductCard({
        category: productCategory,
        images: images.get(product.id) ?? [],
        product,
        variants: variants.get(product.id) ?? [],
      });
    })
    .filter((product): product is CatalogProductCard => product !== null);

  const sortedProducts = sortProducts(products, sort);
  const total = sortedProducts.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;

  return {
    page,
    pageSize: PAGE_SIZE,
    products: sortedProducts.slice(start, start + PAGE_SIZE),
    total,
    totalPages,
  };
}

export async function getPublicProductBySlug(
  slug: string,
): Promise<CatalogProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "benefits, category_id, created_at, description, id, ingredients, name, shelf_life, short_description, slug, storage_instructions, usage_instructions",
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load product");
  }

  if (!data) {
    return null;
  }

  const [categories, variants, images] = await Promise.all([
    getActiveCategoriesByIds([data.category_id]),
    getActiveVariantsByProductIds([data.id]),
    getImagesByProductIds([data.id], new Map([[data.id, data.name]])),
  ]);
  const category = categories.get(data.category_id);

  if (!category) {
    return null;
  }

  const card = mapProductCard({
    category,
    images: images.get(data.id) ?? [],
    product: data,
    variants: variants.get(data.id) ?? [],
  });

  return {
    ...card,
    benefits: data.benefits,
    description: data.description,
    images: images.get(data.id) ?? [],
    ingredients: data.ingredients,
    shelfLife: data.shelf_life,
    storageInstructions: data.storage_instructions,
    usageInstructions: data.usage_instructions,
  };
}
