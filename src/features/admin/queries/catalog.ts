import "server-only";

import { requireAdmin } from "@/features/auth/queries/current-user";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

const PAGE_SIZE = 20;

function searchPattern(query: string) {
  return `%${query.replaceAll("%", "").replaceAll("_", "")}%`;
}

export type AdminProduct = Tables<"products"> & {
  categoryName: string;
  images: Tables<"product_images">[];
  variants: Tables<"product_variants">[];
};

export async function getAdminCategories() {
  await requireAdmin("/admin/categories");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error("Unable to load categories");
  return data;
}

export async function getAdminProducts({
  page,
  query,
  status,
}: {
  page: number;
  query?: string;
  status: "active" | "all" | "draft" | "inactive";
}) {
  await requireAdmin("/admin/products");
  const supabase = await createClient();
  let request = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (status !== "all") request = request.eq("status", status);
  if (query) request = request.ilike("name", searchPattern(query));

  const { count, data, error } = await request;
  if (error) throw new Error("Unable to load products");

  const productIds = data.map((product) => product.id);
  const categoryIds = [...new Set(data.map((product) => product.category_id))];
  const [categoriesResult, variantsResult, imagesResult] = await Promise.all([
    categoryIds.length
      ? supabase.from("categories").select("id, name").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
    productIds.length
      ? supabase
          .from("product_variants")
          .select("*")
          .in("product_id", productIds)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    productIds.length
      ? supabase
          .from("product_images")
          .select("*")
          .in("product_id", productIds)
          .order("is_primary", { ascending: false })
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (categoriesResult.error || variantsResult.error || imagesResult.error) {
    throw new Error("Unable to load product details");
  }

  const categoryMap = new Map(
    categoriesResult.data.map((category) => [category.id, category.name]),
  );

  return {
    page,
    pageSize: PAGE_SIZE,
    products: data.map((product) => ({
      ...product,
      categoryName: categoryMap.get(product.category_id) ?? "Unassigned",
      images: imagesResult.data.filter(
        (image) => image.product_id === product.id,
      ),
      variants: variantsResult.data.filter(
        (variant) => variant.product_id === product.id,
      ),
    })) satisfies AdminProduct[],
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
  };
}
