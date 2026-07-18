import type { MetadataRoute } from "next";

import { getPublicCategories } from "@/features/catalog/queries/catalog";
import { getSiteUrl } from "@/lib/config/env";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl().replace(/\/$/, "");
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/categories",
    "/search",
    "/about",
    "/contact",
  ].map((route) => ({
    changeFrequency: route === "" ? "weekly" : "monthly",
    lastModified: now,
    priority: route === "" ? 1 : 0.7,
    url: `${baseUrl}${route}`,
  }));

  let products: { slug: string; updated_at: string | null }[] = [];
  let categories: Awaited<ReturnType<typeof getPublicCategories>> = [];

  try {
    const supabase = await createClient();
    const [{ data }, categoryRows] = await Promise.all([
      supabase
        .from("products")
        .select("slug, updated_at")
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(500),
      getPublicCategories(),
    ]);
    products = data ?? [];
    categories = categoryRows;
  } catch {
    products = [];
    categories = [];
  }

  return [
    ...staticRoutes,
    ...categories.map((category) => ({
      changeFrequency: "weekly" as const,
      lastModified: now,
      priority: 0.8,
      url: `${baseUrl}/categories/${category.slug}`,
    })),
    ...(products ?? []).map((product) => ({
      changeFrequency: "weekly" as const,
      lastModified: product.updated_at ? new Date(product.updated_at) : now,
      priority: 0.8,
      url: `${baseUrl}/products/${product.slug}`,
    })),
  ];
}
