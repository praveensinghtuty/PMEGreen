import "server-only";

import { requireUser } from "@/features/auth/queries/current-user";
import type {
  CatalogCategory,
  CatalogImage,
  CatalogProductCard,
  CatalogVariant,
} from "@/features/catalog/types/catalog";
import {
  getVariantSummary,
  isVariantAvailable,
} from "@/features/catalog/utils/format";
import { toPublicStorageUrl } from "@/features/catalog/utils/storage";
import type { WishlistSummary } from "@/features/wishlist/types/wishlist";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

type ProductRow = Pick<
  Tables<"products">,
  "category_id" | "created_at" | "id" | "name" | "short_description" | "slug"
>;
type CategoryRow = Pick<
  Tables<"categories">,
  "description" | "id" | "image_path" | "name" | "slug"
>;
type VariantRow = Pick<
  Tables<"product_variants">,
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
type ImageRow = Pick<
  Tables<"product_images">,
  | "alt_text"
  | "id"
  | "is_primary"
  | "product_id"
  | "sort_order"
  | "storage_path"
>;

function mapCategory(row: CategoryRow): CatalogCategory {
  return {
    description: row.description,
    id: row.id,
    imageSrc: row.image_path
      ? toPublicStorageUrl("site-assets", row.image_path)
      : null,
    name: row.name,
    slug: row.slug,
  };
}

function mapVariant(row: VariantRow): CatalogVariant {
  return {
    compareAtPrice: row.compare_at_price,
    id: row.id,
    isDefault: row.is_default,
    name: row.name,
    price: row.price,
    stockQuantity: row.stock_quantity,
    trackInventory: row.track_inventory,
    unit: row.unit,
    value: row.value,
  };
}

function mapImage(row: ImageRow, productName: string): CatalogImage {
  return {
    alt: row.alt_text ?? productName,
    id: row.id,
    isPrimary: row.is_primary,
    sortOrder: row.sort_order,
    src: toPublicStorageUrl("product-images", row.storage_path),
  };
}

export async function getWishlistProductIds() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Set<string>();
  }

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!wishlist) {
    return new Set<string>();
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("wishlist_id", wishlist.id);

  if (error) {
    return new Set<string>();
  }

  return new Set(data.map((item) => item.product_id));
}

export async function getWishlistSummary(): Promise<WishlistSummary> {
  const user = await requireUser("/wishlist");
  const supabase = await createClient();
  const { data: wishlist, error: wishlistError } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (wishlistError) {
    throw new Error("Unable to load wishlist");
  }

  if (!wishlist) {
    return { hiddenItemCount: 0, products: [] };
  }

  const { data: wishlistItems, error: itemError } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("wishlist_id", wishlist.id)
    .order("created_at", { ascending: false });

  if (itemError) {
    throw new Error("Unable to load wishlist items");
  }

  const productIds = wishlistItems.map((item) => item.product_id);

  if (productIds.length === 0) {
    return { hiddenItemCount: 0, products: [] };
  }

  const { data: products, error: productError } = await supabase
    .from("products")
    .select("category_id, created_at, id, name, short_description, slug")
    .in("id", productIds)
    .eq("status", "active");

  if (productError) {
    throw new Error("Unable to load wishlist products");
  }

  if (products.length === 0) {
    return { hiddenItemCount: productIds.length, products: [] };
  }

  const categoryIds = [
    ...new Set(products.map((product) => product.category_id)),
  ];
  const productIdSet = new Set(products.map((product) => product.id));
  const productNames = new Map(
    products.map((product) => [product.id, product.name]),
  );
  const [categoriesResult, variantsResult, imagesResult] = await Promise.all([
    supabase
      .from("categories")
      .select("description, id, image_path, name, slug")
      .in("id", categoryIds)
      .eq("is_active", true),
    supabase
      .from("product_variants")
      .select(
        "compare_at_price, id, is_default, name, price, product_id, stock_quantity, track_inventory, unit, value",
      )
      .in(
        "product_id",
        products.map((product) => product.id),
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_images")
      .select("alt_text, id, is_primary, product_id, sort_order, storage_path")
      .in(
        "product_id",
        products.map((product) => product.id),
      )
      .order("is_primary", { ascending: false })
      .order("sort_order", { ascending: true }),
  ]);

  if (categoriesResult.error || variantsResult.error || imagesResult.error) {
    throw new Error("Unable to load wishlist product details");
  }

  const categoryMap = new Map(
    categoriesResult.data.map((category) => [
      category.id,
      mapCategory(category),
    ]),
  );
  const variantsByProduct = new Map<string, CatalogVariant[]>();
  for (const row of variantsResult.data) {
    variantsByProduct.set(row.product_id, [
      ...(variantsByProduct.get(row.product_id) ?? []),
      mapVariant(row),
    ]);
  }
  const imagesByProduct = new Map<string, CatalogImage[]>();
  for (const row of imagesResult.data) {
    imagesByProduct.set(row.product_id, [
      ...(imagesByProduct.get(row.product_id) ?? []),
      mapImage(row, productNames.get(row.product_id) ?? "Product image"),
    ]);
  }

  const productsById = new Map(
    products.map((product) => [product.id, product]),
  );
  const cards: CatalogProductCard[] = productIds
    .map((productId) => {
      const product = productsById.get(productId);
      if (!product) {
        return null;
      }

      return mapWishlistProductCard({
        categories: categoryMap,
        images: imagesByProduct.get(product.id) ?? [],
        product,
        variants: variantsByProduct.get(product.id) ?? [],
      });
    })
    .filter((product): product is CatalogProductCard => product !== null);

  return {
    hiddenItemCount: productIds.filter(
      (productId) => !productIdSet.has(productId),
    ).length,
    products: cards,
  };
}

function mapWishlistProductCard({
  categories,
  images,
  product,
  variants,
}: {
  categories: Map<string, CatalogCategory>;
  images: CatalogImage[];
  product: ProductRow;
  variants: CatalogVariant[];
}): CatalogProductCard | null {
  const category = categories.get(product.category_id);

  if (!category) {
    return null;
  }

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
    category,
    createdAt: product.created_at,
    id: product.id,
    isAvailable: sortedVariants.some(isVariantAvailable),
    name: product.name,
    primaryImage: sortedImages[0] ?? null,
    shortDescription: product.short_description,
    slug: product.slug,
    startingPrice:
      sortedVariants.length > 0
        ? Math.min(...sortedVariants.map((variant) => variant.price))
        : null,
    variantSummary: getVariantSummary(sortedVariants),
    variants: sortedVariants,
  };
}
