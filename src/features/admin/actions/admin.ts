"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/features/auth/queries/current-user";
import {
  adminBannerSchema,
  adminCategorySchema,
  adminIdSchema,
  adminOrderUpdateSchema,
  adminProductImageSchema,
  adminProductSchema,
  adminSettingsSchema,
  adminVariantSchema,
} from "@/features/admin/schemas/admin";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : undefined;
}

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function adminError(path: string, code: string): never {
  redirect(`${path}?adminError=${encodeURIComponent(code)}`);
}

function adminSuccess(path: string, code = "saved"): never {
  redirect(`${path}?adminSuccess=${encodeURIComponent(code)}`);
}

function fileValue(formData: FormData, key: string) {
  const file = formData.get(key);
  return file instanceof File && file.size > 0 ? file : null;
}

function validateImageFile(file: File) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
  ];
  return allowedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024;
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin("/admin/categories");
  const parsed = adminCategorySchema.safeParse({
    description: value(formData, "description"),
    id: value(formData, "id"),
    imagePath: value(formData, "imagePath"),
    isActive: checkbox(formData, "isActive"),
    name: value(formData, "name"),
    parentId: value(formData, "parentId"),
    slug: value(formData, "slug"),
    sortOrder: value(formData, "sortOrder"),
  });

  if (!parsed.success) adminError("/admin/categories", "invalid-category");

  const supabase = await createClient();
  const row = {
    description: parsed.data.description,
    image_path: parsed.data.imagePath,
    is_active: parsed.data.isActive,
    name: parsed.data.name,
    parent_id: parsed.data.parentId,
    slug: parsed.data.slug,
    sort_order: parsed.data.sortOrder,
  };
  const result = parsed.data.id
    ? await supabase.from("categories").update(row).eq("id", parsed.data.id)
    : await supabase.from("categories").insert(row);

  if (result.error) adminError("/admin/categories", "save-failed");
  revalidatePath("/admin/categories");
  adminSuccess("/admin/categories");
}

export async function toggleCategoryAction(formData: FormData) {
  await requireAdmin("/admin/categories");
  const parsed = adminIdSchema.safeParse({ id: value(formData, "id") });
  if (!parsed.success) adminError("/admin/categories", "invalid-category");
  const isActive = checkbox(formData, "isActive");
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", parsed.data.id);
  if (error) adminError("/admin/categories", "toggle-failed");
  revalidatePath("/admin/categories");
  adminSuccess("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin("/admin/categories");
  const parsed = adminIdSchema.safeParse({ id: value(formData, "id") });
  if (!parsed.success) adminError("/admin/categories", "invalid-category");
  const supabase = await createClient();
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", parsed.data.id);
  if ((count ?? 0) > 0) adminError("/admin/categories", "delete-blocked");
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", parsed.data.id);
  if (error) adminError("/admin/categories", "delete-failed");
  revalidatePath("/admin/categories");
  adminSuccess("/admin/categories");
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin("/admin/products");
  const parsed = adminProductSchema.safeParse({
    benefits: value(formData, "benefits"),
    categoryId: value(formData, "categoryId"),
    description: value(formData, "description"),
    id: value(formData, "id"),
    ingredients: value(formData, "ingredients"),
    isBestseller: checkbox(formData, "isBestseller"),
    isFeatured: checkbox(formData, "isFeatured"),
    name: value(formData, "name"),
    shelfLife: value(formData, "shelfLife"),
    shortDescription: value(formData, "shortDescription"),
    slug: value(formData, "slug"),
    sortOrder: value(formData, "sortOrder"),
    status: value(formData, "status"),
    storageInstructions: value(formData, "storageInstructions"),
    usageInstructions: value(formData, "usageInstructions"),
  });
  if (!parsed.success) adminError("/admin/products", "invalid-product");
  const supabase = await createClient();
  const row = {
    benefits: parsed.data.benefits,
    category_id: parsed.data.categoryId,
    description: parsed.data.description,
    ingredients: parsed.data.ingredients,
    is_bestseller: parsed.data.isBestseller,
    is_featured: parsed.data.isFeatured,
    name: parsed.data.name,
    shelf_life: parsed.data.shelfLife,
    short_description: parsed.data.shortDescription,
    slug: parsed.data.slug,
    sort_order: parsed.data.sortOrder,
    status: parsed.data.status,
    storage_instructions: parsed.data.storageInstructions,
    usage_instructions: parsed.data.usageInstructions,
  };
  const result = parsed.data.id
    ? await supabase.from("products").update(row).eq("id", parsed.data.id)
    : await supabase.from("products").insert(row);
  if (result.error) adminError("/admin/products", "save-failed");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  adminSuccess("/admin/products");
}

export async function toggleProductAction(formData: FormData) {
  await requireAdmin("/admin/products");
  const parsed = adminIdSchema.safeParse({ id: value(formData, "id") });
  if (!parsed.success) adminError("/admin/products", "invalid-product");
  const status = value(formData, "status") === "active" ? "active" : "inactive";
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", parsed.data.id);
  if (error) adminError("/admin/products", "toggle-failed");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  adminSuccess("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin("/admin/products");
  const parsed = adminIdSchema.safeParse({ id: value(formData, "id") });
  if (!parsed.success) adminError("/admin/products", "invalid-product");
  const supabase = await createClient();
  const { count } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", parsed.data.id);
  if ((count ?? 0) > 0) adminError("/admin/products", "delete-blocked");
  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", parsed.data.id);
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", parsed.data.id);
  if (error) adminError("/admin/products", "delete-failed");
  const imagePaths = images?.map((image) => image.storage_path) ?? [];
  if (imagePaths.length > 0) {
    await supabase.storage.from("product-images").remove(imagePaths);
  }
  revalidatePath("/admin/products");
  adminSuccess("/admin/products");
}

export async function saveVariantAction(formData: FormData) {
  await requireAdmin("/admin/products");
  const parsed = adminVariantSchema.safeParse({
    compareAtPrice: value(formData, "compareAtPrice"),
    id: value(formData, "id"),
    isActive: checkbox(formData, "isActive"),
    isDefault: checkbox(formData, "isDefault"),
    name: value(formData, "name"),
    price: value(formData, "price"),
    productId: value(formData, "productId"),
    sku: value(formData, "sku"),
    sortOrder: value(formData, "sortOrder"),
    stockQuantity: value(formData, "stockQuantity"),
    trackInventory: checkbox(formData, "trackInventory"),
    unit: value(formData, "unit"),
    value: value(formData, "value"),
  });
  if (!parsed.success) adminError("/admin/products", "invalid-variant");
  const supabase = await createClient();
  const row = {
    compare_at_price: parsed.data.compareAtPrice,
    is_active: parsed.data.isActive,
    is_default: parsed.data.isDefault,
    name: parsed.data.name,
    price: parsed.data.price,
    product_id: parsed.data.productId,
    sku: parsed.data.sku,
    sort_order: parsed.data.sortOrder,
    stock_quantity: parsed.data.stockQuantity,
    track_inventory: parsed.data.trackInventory,
    unit: parsed.data.unit,
    value: parsed.data.value,
  };
  const result = parsed.data.id
    ? await supabase
        .from("product_variants")
        .update(row)
        .eq("id", parsed.data.id)
    : await supabase.from("product_variants").insert(row);
  if (result.error) adminError("/admin/products", "variant-save-failed");
  revalidatePath("/admin/products");
  adminSuccess("/admin/products");
}

export async function saveProductImageAction(formData: FormData) {
  await requireAdmin("/admin/products");
  const parsed = adminProductImageSchema.safeParse({
    altText: value(formData, "altText"),
    id: value(formData, "id"),
    isPrimary: checkbox(formData, "isPrimary"),
    productId: value(formData, "productId"),
    sortOrder: value(formData, "sortOrder"),
    storagePath: value(formData, "storagePath"),
  });
  if (!parsed.success) adminError("/admin/products", "invalid-image");
  const supabase = await createClient();
  const row = {
    alt_text: parsed.data.altText,
    is_primary: parsed.data.isPrimary,
    product_id: parsed.data.productId,
    sort_order: parsed.data.sortOrder,
    storage_path: parsed.data.storagePath,
  };
  const result = parsed.data.id
    ? await supabase.from("product_images").update(row).eq("id", parsed.data.id)
    : await supabase.from("product_images").insert(row);
  if (result.error) adminError("/admin/products", "image-save-failed");
  revalidatePath("/admin/products");
  adminSuccess("/admin/products");
}

export async function uploadProductImageAction(formData: FormData) {
  await requireAdmin("/admin/products");
  const productId = value(formData, "productId");
  const file = fileValue(formData, "image");
  const parsed = adminProductImageSchema
    .pick({ altText: true, productId: true, sortOrder: true })
    .safeParse({
      altText: value(formData, "altText"),
      productId,
      sortOrder: value(formData, "sortOrder"),
    });

  if (!parsed.success || !file || !validateImageFile(file)) {
    adminError("/admin/products", "invalid-upload");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const storagePath = `${parsed.data.productId}/${crypto.randomUUID()}.${extension}`;
  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) adminError("/admin/products", "upload-failed");

  const { error } = await supabase.from("product_images").insert({
    alt_text: parsed.data.altText,
    is_primary: checkbox(formData, "isPrimary"),
    product_id: parsed.data.productId,
    sort_order: parsed.data.sortOrder,
    storage_path: storagePath,
  });

  if (error) adminError("/admin/products", "image-save-failed");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  adminSuccess("/admin/products", "uploaded");
}

export async function deleteProductImageAction(formData: FormData) {
  await requireAdmin("/admin/products");
  const parsed = adminIdSchema.safeParse({ id: value(formData, "id") });
  if (!parsed.success) adminError("/admin/products", "invalid-image");
  const supabase = await createClient();
  const { data: image } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("id", parsed.data.id)
    .maybeSingle();
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", parsed.data.id);
  if (error) adminError("/admin/products", "image-delete-failed");
  if (image) {
    await supabase.storage.from("product-images").remove([image.storage_path]);
  }
  revalidatePath("/admin/products");
  adminSuccess("/admin/products");
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin("/admin/settings");
  const parsed = adminSettingsSchema.safeParse({
    businessAddress: value(formData, "businessAddress"),
    businessEmail: value(formData, "businessEmail"),
    businessLogo: value(formData, "businessLogo"),
    businessName: value(formData, "businessName"),
    businessPhone: value(formData, "businessPhone"),
    paymentUpiId: value(formData, "paymentUpiId"),
    paymentUpiQr: value(formData, "paymentUpiQr"),
    shippingDefaultCharge: value(formData, "shippingDefaultCharge"),
  });
  if (!parsed.success) adminError("/admin/settings", "invalid-settings");
  const supabase = await createClient();
  const rows = [
    ["business.name", parsed.data.businessName, true],
    ["business.phone", parsed.data.businessPhone, true],
    ["business.email", parsed.data.businessEmail, true],
    ["business.address", parsed.data.businessAddress, true],
    ["business.logo", parsed.data.businessLogo, true],
    ["shipping.default_charge", parsed.data.shippingDefaultCharge, true],
    ["payment.upi_id", parsed.data.paymentUpiId, true],
    ["payment.upi_qr", parsed.data.paymentUpiQr, true],
  ].map(([key, settingValue, isPublic]) => ({
    is_public: Boolean(isPublic),
    key: String(key),
    value: settingValue,
  }));
  const { error } = await supabase
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) adminError("/admin/settings", "save-failed");
  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  adminSuccess("/admin/settings");
}

export async function uploadSiteAssetAction(formData: FormData) {
  await requireAdmin("/admin/settings");
  const file = fileValue(formData, "asset");
  const settingKey = value(formData, "settingKey");

  if (
    !file ||
    !validateImageFile(file) ||
    !["business.logo", "payment.upi_qr"].includes(settingKey ?? "")
  ) {
    adminError("/admin/settings", "invalid-upload");
  }

  const safeSettingKey = settingKey as "business.logo" | "payment.upi_qr";
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const storagePath = `admin/${safeSettingKey}/${crypto.randomUUID()}.${extension}`;
  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from("site-assets")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) adminError("/admin/settings", "upload-failed");

  const { error } = await supabase.from("site_settings").upsert(
    {
      is_public: true,
      key: safeSettingKey,
      value: storagePath,
    },
    { onConflict: "key" },
  );

  if (error) adminError("/admin/settings", "asset-save-failed");
  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  adminSuccess("/admin/settings", "uploaded");
}

export async function updateOrderAction(formData: FormData) {
  await requireAdmin("/admin/orders");
  const parsed = adminOrderUpdateSchema.safeParse({
    adminNotes: value(formData, "adminNotes"),
    courierName: value(formData, "courierName"),
    historyNote: value(formData, "historyNote"),
    orderId: value(formData, "orderId"),
    paymentStatus: value(formData, "paymentStatus") || undefined,
    status: value(formData, "status") || undefined,
    trackingNumber: value(formData, "trackingNumber"),
    trackingUrl: value(formData, "trackingUrl"),
  });
  if (!parsed.success) adminError("/admin/orders", "invalid-order");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_order", {
    p_admin_notes: parsed.data.adminNotes ?? undefined,
    p_courier_name: parsed.data.courierName ?? undefined,
    p_history_note: parsed.data.historyNote ?? undefined,
    p_order_id: parsed.data.orderId,
    p_payment_status: parsed.data.paymentStatus,
    p_status: parsed.data.status,
    p_tracking_number: parsed.data.trackingNumber ?? undefined,
    p_tracking_url: parsed.data.trackingUrl ?? undefined,
  });
  if (error) adminError("/admin/orders", "update-failed");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  adminSuccess(`/admin/orders/${parsed.data.orderId}`);
}

export async function saveBannerAction(formData: FormData) {
  await requireAdmin("/admin/banners");
  const parsed = adminBannerSchema.safeParse({
    id: value(formData, "id"),
    imagePath: value(formData, "imagePath"),
    isActive: checkbox(formData, "isActive"),
    linkType: value(formData, "linkType"),
    linkValue: value(formData, "linkValue"),
    sortOrder: value(formData, "sortOrder"),
    subtitle: value(formData, "subtitle"),
    title: value(formData, "title"),
  });
  if (!parsed.success) adminError("/admin/banners", "invalid-banner");
  const supabase = await createClient();
  const row = {
    image_path: parsed.data.imagePath,
    is_active: parsed.data.isActive,
    link_type: parsed.data.linkType,
    link_value: parsed.data.linkType === "none" ? null : parsed.data.linkValue,
    sort_order: parsed.data.sortOrder,
    subtitle: parsed.data.subtitle,
    title: parsed.data.title,
  };
  const result = parsed.data.id
    ? await supabase.from("banners").update(row).eq("id", parsed.data.id)
    : await supabase.from("banners").insert(row);
  if (result.error) adminError("/admin/banners", "save-failed");
  revalidatePath("/admin/banners");
  revalidatePath("/");
  adminSuccess("/admin/banners");
}

export async function deleteBannerAction(formData: FormData) {
  await requireAdmin("/admin/banners");
  const parsed = adminIdSchema.safeParse({ id: value(formData, "id") });
  if (!parsed.success) adminError("/admin/banners", "invalid-banner");
  const supabase = await createClient();
  const { error } = await supabase
    .from("banners")
    .delete()
    .eq("id", parsed.data.id);
  if (error) adminError("/admin/banners", "delete-failed");
  revalidatePath("/admin/banners");
  revalidatePath("/");
  adminSuccess("/admin/banners");
}
