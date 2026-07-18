import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const optionalText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

const text = (max = 200) => z.string().trim().min(1).max(max);

export const adminSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  q: z.string().trim().max(120).optional().catch(undefined),
  status: z
    .enum([
      "all",
      "active",
      "draft",
      "inactive",
      "placed",
      "confirmed",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
    ])
    .catch("all"),
});

export const adminCategorySchema = z.object({
  description: optionalText(500),
  id: z.string().uuid().optional(),
  imagePath: optionalText(500),
  isActive: z.boolean().catch(false),
  name: text(120),
  parentId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  slug: slugSchema,
  sortOrder: z.coerce.number().int().min(0).max(100000).catch(0),
});

export const adminProductSchema = z.object({
  benefits: optionalText(2000),
  categoryId: z.string().uuid(),
  description: optionalText(4000),
  id: z.string().uuid().optional(),
  ingredients: optionalText(2000),
  isBestseller: z.boolean().catch(false),
  isFeatured: z.boolean().catch(false),
  name: text(180),
  shelfLife: optionalText(500),
  shortDescription: optionalText(500),
  slug: slugSchema,
  sortOrder: z.coerce.number().int().min(0).max(100000).catch(0),
  status: z.enum(["draft", "active", "inactive"]),
  storageInstructions: optionalText(1000),
  usageInstructions: optionalText(1000),
});

export const adminVariantSchema = z.object({
  compareAtPrice: z.coerce
    .number()
    .min(0)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  id: z.string().uuid().optional(),
  isActive: z.boolean().catch(false),
  isDefault: z.boolean().catch(false),
  name: text(120),
  price: z.coerce.number().min(0),
  productId: z.string().uuid(),
  sku: optionalText(80),
  sortOrder: z.coerce.number().int().min(0).max(100000).catch(0),
  stockQuantity: z.coerce.number().int().min(0),
  trackInventory: z.boolean().catch(false),
  unit: z
    .enum(["ml", "l", "g", "kg", "piece", "pack", "other"])
    .optional()
    .or(z.literal("").transform(() => undefined)),
  value: z.coerce
    .number()
    .positive()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const adminProductImageSchema = z.object({
  altText: optionalText(180),
  id: z.string().uuid().optional(),
  isPrimary: z.boolean().catch(false),
  productId: z.string().uuid(),
  sortOrder: z.coerce.number().int().min(0).max(100000).catch(0),
  storagePath: text(500),
});

export const adminIdSchema = z.object({
  id: z.string().uuid(),
});

export const adminSettingsSchema = z.object({
  businessAddress: optionalText(500),
  businessEmail: optionalText(180),
  businessLogo: optionalText(500),
  businessName: text(180),
  businessPhone: optionalText(40),
  paymentUpiId: optionalText(120),
  paymentUpiQr: optionalText(500),
  shippingDefaultCharge: z.coerce.number().min(0).max(100000),
});

export const adminOrderUpdateSchema = z.object({
  adminNotes: optionalText(2000),
  courierName: optionalText(120),
  historyNote: optionalText(500),
  orderId: z.string().uuid(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  status: z
    .enum([
      "placed",
      "confirmed",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
    ])
    .optional(),
  trackingNumber: optionalText(120),
  trackingUrl: optionalText(500).refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a valid tracking URL"),
});

export const adminBannerSchema = z
  .object({
    id: z.string().uuid().optional(),
    imagePath: text(500),
    isActive: z.boolean().catch(false),
    linkType: z.enum(["product", "category", "external", "none"]),
    linkValue: optionalText(500),
    sortOrder: z.coerce.number().int().min(0).max(100000).catch(0),
    subtitle: optionalText(500),
    title: text(180),
  })
  .superRefine((value, context) => {
    if (value.linkType !== "none" && !value.linkValue) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link value is required for linked banners",
        path: ["linkValue"],
      });
    }
  });
