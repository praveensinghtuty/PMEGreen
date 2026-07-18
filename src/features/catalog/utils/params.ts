import { z } from "zod";

import type { CatalogSort } from "@/features/catalog/types/catalog";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const searchSchema = z.string().trim().max(80).optional().catch(undefined);

const sortSchema = z
  .enum(["featured", "name-asc", "price-asc", "price-desc", "newest"])
  .catch("featured");

const pageSchema = z.coerce.number().int().min(1).max(100).catch(1);

export function parseSlug(slug: string) {
  return slugSchema.safeParse(slug);
}

export function parseCatalogSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  const getSingle = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const category = getSingle("category");

  return {
    category: category
      ? slugSchema.safeParse(category).success
        ? category
        : undefined
      : undefined,
    page: pageSchema.parse(getSingle("page")),
    query: searchSchema.parse(getSingle("q")),
    sort: sortSchema.parse(getSingle("sort")) as CatalogSort,
  };
}

export function buildCatalogHref({
  category,
  page,
  query,
  sort,
}: {
  category?: string;
  page?: number;
  query?: string;
  sort?: CatalogSort;
}) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (query) {
    params.set("q", query);
  }

  if (sort && sort !== "featured") {
    params.set("sort", sort);
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  const serialized = params.toString();
  return serialized ? `/shop?${serialized}` : "/shop";
}
