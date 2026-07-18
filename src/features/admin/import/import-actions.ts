"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/features/auth/queries/current-user";
import {
  buildCatalogImportPlan,
  planToRpcPayload,
  type CatalogImportPlan,
} from "@/features/admin/import/catalog-import";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/supabase";

export type ImportActionState = {
  imported?: boolean;
  message?: string;
  report?: CatalogImportPlan;
};

export async function dryRunCatalogImportAction(
  _previousState: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  await requireAdmin("/admin/import");
  const csv = getCsvContent(formData);
  const defaultCategoryName = textValue(formData, "defaultCategoryName");
  const context = await getImportContext(defaultCategoryName);
  const report = buildCatalogImportPlan(csv, context);

  return {
    message:
      report.errors.length > 0
        ? "Dry run found validation errors. Nothing was written."
        : "Dry run passed. Nothing was written.",
    report,
  };
}

export async function executeCatalogImportAction(
  _previousState: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  await requireAdmin("/admin/import");
  const csv = getCsvContent(formData);
  const defaultCategoryName = textValue(formData, "defaultCategoryName");
  const context = await getImportContext(defaultCategoryName);
  const report = buildCatalogImportPlan(csv, context);

  if (report.errors.length > 0) {
    return {
      message: "Import blocked. Fix validation errors and run dry-run again.",
      report,
    };
  }

  const supabase = await createClient();
  const payload = planToRpcPayload(report) as Json;
  const { data, error } = await supabase.rpc("admin_import_catalog", {
    p_payload: payload,
  });

  if (error) {
    return {
      message: "Import failed and the database rolled back the transaction.",
      report: {
        ...report,
        errors: [
          ...report.errors,
          {
            code: "import-failed",
            message: "The database rejected the import.",
            severity: "error",
          },
        ],
      },
    };
  }

  revalidatePath("/admin/import");
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  revalidatePath("/shop");

  return {
    imported: true,
    message: "Import completed atomically.",
    report: mergeRpcResult(report, data),
  };
}

async function getImportContext(defaultCategoryName?: string) {
  const supabase = await createClient();
  const [
    { data: categories },
    { data: products },
    { data: variants },
    imageFilenames,
  ] = await Promise.all([
    supabase.from("categories").select("slug"),
    supabase.from("products").select("slug"),
    supabase.from("product_variants").select("sku").not("sku", "is", null),
    listImportImageFilenames(),
  ]);

  return {
    defaultCategoryName,
    existingCategorySlugs: new Set(
      (categories ?? []).map((category) => category.slug),
    ),
    existingProductSlugs: new Set(
      (products ?? []).map((product) => product.slug),
    ),
    existingSkus: new Set(
      (variants ?? [])
        .map((variant) => variant.sku)
        .filter((sku): sku is string => Boolean(sku)),
    ),
    imageFilenames,
  };
}

async function listImportImageFilenames() {
  const importImageDirectory = path.join(
    process.cwd(),
    "public",
    "import-images",
  );
  try {
    const files = await fs.readdir(importImageDirectory, {
      withFileTypes: true,
    });
    return new Set(
      files
        .filter((file) => file.isFile())
        .map((file) => file.name.toLowerCase()),
    );
  } catch {
    return new Set<string>();
  }
}

function getCsvContent(formData: FormData) {
  const csv = textValue(formData, "csv");
  return csv ?? "";
}

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value : undefined;
}

function mergeRpcResult(report: CatalogImportPlan, data: unknown) {
  if (!data || typeof data !== "object") return report;
  const result = data as {
    categories_created?: number;
    products_created?: number;
    variants_created?: number;
  };

  return {
    ...report,
    productsToCreate: result.products_created ?? report.productsToCreate,
    variantsToCreate: result.variants_created ?? report.variantsToCreate,
  };
}
