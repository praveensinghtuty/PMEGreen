import "server-only";

import { requireUser } from "@/features/auth/queries/current-user";
import { getVariantSummary } from "@/features/catalog/utils/format";
import { toPublicStorageUrl } from "@/features/catalog/utils/storage";
import type { CartLineItem, CartSummary } from "@/features/cart/types/cart";
import { isSupabaseConfigured } from "@/lib/config/env";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

type CartItemRow = Pick<Tables<"cart_items">, "id" | "quantity" | "variant_id">;

type VariantRow = Pick<
  Tables<"product_variants">,
  | "id"
  | "is_default"
  | "name"
  | "price"
  | "product_id"
  | "stock_quantity"
  | "track_inventory"
  | "unit"
  | "value"
  | "compare_at_price"
>;

type ProductRow = Pick<
  Tables<"products">,
  "category_id" | "id" | "name" | "short_description" | "slug"
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

function variantLabel(variant: VariantRow) {
  return getVariantSummary([
    {
      compareAtPrice: variant.compare_at_price,
      id: variant.id,
      isDefault: variant.is_default,
      name: variant.name,
      price: variant.price,
      stockQuantity: variant.stock_quantity,
      trackInventory: variant.track_inventory,
      unit: variant.unit,
      value: variant.value,
    },
  ]);
}

export async function getCartItemCount() {
  const user = await requireUser("/cart");
  const supabase = await createClient();
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cart) {
    return 0;
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("cart_id", cart.id);

  if (error) {
    return 0;
  }

  return data.reduce((total, item) => total + item.quantity, 0);
}

export async function getOptionalCartItemCount() {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cart) {
    return 0;
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("cart_id", cart.id);

  if (error) {
    return 0;
  }

  return data.reduce((total, item) => total + item.quantity, 0);
}

export async function getCartSummary(): Promise<CartSummary> {
  const user = await requireUser("/cart");
  const supabase = await createClient();
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (cartError) {
    throw new Error("Unable to load cart");
  }

  if (!cart) {
    return { items: [], subtotal: 0, unavailableItemCount: 0 };
  }

  const { data: itemRows, error: itemsError } = await supabase
    .from("cart_items")
    .select("id, quantity, variant_id")
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    throw new Error("Unable to load cart items");
  }

  return buildCartSummary(itemRows);
}

async function buildCartSummary(itemRows: CartItemRow[]): Promise<CartSummary> {
  const supabase = await createClient();
  const variantIds = itemRows.map((item) => item.variant_id);

  if (variantIds.length === 0) {
    return { items: [], subtotal: 0, unavailableItemCount: 0 };
  }

  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .select(
      "id, is_default, name, price, product_id, stock_quantity, track_inventory, unit, value, compare_at_price",
    )
    .in("id", variantIds)
    .eq("is_active", true);

  if (variantError) {
    throw new Error("Unable to load cart variants");
  }

  const productIds = [
    ...new Set(variants.map((variant) => variant.product_id)),
  ];
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("category_id, id, name, short_description, slug")
    .in("id", productIds)
    .eq("status", "active");

  if (productError) {
    throw new Error("Unable to load cart products");
  }

  const activeProducts = products;
  const productMap = new Map<string, ProductRow>(
    activeProducts.map((product) => [product.id, product]),
  );
  const visibleVariants = variants.filter((variant) =>
    productMap.has(variant.product_id),
  );
  const productNameMap = new Map(
    activeProducts.map((product) => [product.id, product.name]),
  );
  const { data: images, error: imageError } = await supabase
    .from("product_images")
    .select("alt_text, id, is_primary, product_id, sort_order, storage_path")
    .in(
      "product_id",
      activeProducts.map((product) => product.id),
    )
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  if (imageError) {
    throw new Error("Unable to load cart images");
  }

  const imageMap = new Map<string, ImageRow>();
  for (const image of images) {
    if (!imageMap.has(image.product_id)) {
      imageMap.set(image.product_id, image);
    }
  }

  const variantMap = new Map<string, VariantRow>(
    visibleVariants.map((variant) => [variant.id, variant]),
  );

  const items: CartLineItem[] = itemRows.map((item) => {
    const variant = variantMap.get(item.variant_id);
    const product = variant ? productMap.get(variant.product_id) : null;
    const image = product ? imageMap.get(product.id) : null;
    const unitPrice = variant?.price ?? null;

    return {
      id: item.id,
      image: image
        ? {
            alt: image.alt_text ?? productNameMap.get(image.product_id) ?? "",
            id: image.id,
            isPrimary: image.is_primary,
            sortOrder: image.sort_order,
            src: toPublicStorageUrl("product-images", image.storage_path),
          }
        : null,
      isAvailable: Boolean(
        variant &&
        product &&
        (!variant.track_inventory || variant.stock_quantity >= item.quantity),
      ),
      lineTotal: unitPrice ? unitPrice * item.quantity : 0,
      productName: product?.name ?? null,
      productSlug: product?.slug ?? null,
      quantity: item.quantity,
      unitPrice,
      variantLabel: variant ? variantLabel(variant) : null,
    };
  });

  return {
    items,
    subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
    unavailableItemCount: items.filter((item) => !item.isAvailable).length,
  };
}
