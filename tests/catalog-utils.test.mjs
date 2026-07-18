import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadTypeScriptModule(relativePath) {
  const filename = path.resolve(relativePath);
  const source = require("node:fs").readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText;
  const compiledModule = { exports: {} };
  const localRequire = createRequire(filename);
  const fn = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    output,
  );

  fn(
    compiledModule.exports,
    localRequire,
    compiledModule,
    filename,
    path.dirname(filename),
  );

  return compiledModule.exports;
}

const params = loadTypeScriptModule("src/features/catalog/utils/params.ts");
const format = loadTypeScriptModule("src/features/catalog/utils/format.ts");
const cartSchemas = loadTypeScriptModule("src/features/cart/schemas/cart.ts");
const addressSchemas = loadTypeScriptModule(
  "src/features/addresses/schemas/address.ts",
);
const adminSchemas = loadTypeScriptModule(
  "src/features/admin/schemas/admin.ts",
);
const checkoutSchemas = loadTypeScriptModule(
  "src/features/checkout/schemas/checkout.ts",
);
const wishlistSchemas = loadTypeScriptModule(
  "src/features/wishlist/schemas/wishlist.ts",
);

test("parseSlug accepts clean storefront slugs only", () => {
  assert.equal(params.parseSlug("cold-pressed-oil").success, true);
  assert.equal(params.parseSlug("bad slug").success, false);
  assert.equal(params.parseSlug("../admin").success, false);
});

test("parseCatalogSearchParams normalizes unsafe or unsupported values", () => {
  assert.deepEqual(
    params.parseCatalogSearchParams({
      category: "valid-category",
      page: "2",
      q: "  oil  ",
      sort: "price-asc",
    }),
    {
      category: "valid-category",
      page: 2,
      query: "oil",
      sort: "price-asc",
    },
  );

  assert.deepEqual(
    params.parseCatalogSearchParams({
      category: "bad category",
      page: "-1",
      q: "x".repeat(120),
      sort: "unknown",
    }),
    {
      category: undefined,
      page: 1,
      query: undefined,
      sort: "featured",
    },
  );
});

test("buildCatalogHref keeps default params out of clean storefront URLs", () => {
  assert.equal(params.buildCatalogHref({ sort: "featured" }), "/shop");
  assert.equal(
    params.buildCatalogHref({
      category: "oils",
      page: 3,
      query: "gingelly oil",
      sort: "price-desc",
    }),
    "/shop?category=oils&q=gingelly+oil&sort=price-desc&page=3",
  );
});

test("catalog formatting renders prices and variant labels safely", () => {
  assert.equal(format.formatMoney(125), "₹125");
  assert.equal(
    format.formatVariantMeasure({
      id: "1",
      name: "Default",
      price: 125,
      compareAtPrice: null,
      stockQuantity: 1,
      trackInventory: true,
      isDefault: true,
      value: 500,
      unit: "ml",
    }),
    "500 ml",
  );
});

test("variant availability follows active storefront stock rules", () => {
  assert.equal(
    format.isVariantAvailable({
      id: "1",
      name: "Tracked",
      price: 100,
      compareAtPrice: null,
      stockQuantity: 0,
      trackInventory: true,
      isDefault: false,
      value: null,
      unit: null,
    }),
    false,
  );
  assert.equal(
    format.isVariantAvailable({
      id: "2",
      name: "Untracked",
      price: 100,
      compareAtPrice: null,
      stockQuantity: 0,
      trackInventory: false,
      isDefault: false,
      value: null,
      unit: null,
    }),
    true,
  );
});

test("cart add validation accepts only valid variants and bounded quantities", () => {
  const valid = cartSchemas.cartAddSchema.safeParse({
    quantity: "2",
    returnPath: "/products/test-product",
    variantId: "30000000-0000-4000-8000-000000000201",
  });

  assert.equal(valid.success, true);
  assert.equal(valid.data.quantity, 2);

  const invalid = cartSchemas.cartAddSchema.safeParse({
    quantity: "100",
    returnPath: "//evil.example",
    variantId: "not-a-uuid",
  });

  assert.equal(invalid.success, false);
});

test("cart item quantity validation rejects invalid mutation inputs", () => {
  assert.equal(
    cartSchemas.cartItemQuantitySchema.safeParse({
      itemId: "30000000-0000-4000-8000-000000000301",
      quantity: 1,
      returnPath: "/cart",
    }).success,
    true,
  );
  assert.equal(
    cartSchemas.cartItemQuantitySchema.safeParse({
      itemId: "30000000-0000-4000-8000-000000000301",
      quantity: 0,
      returnPath: "/cart",
    }).success,
    false,
  );
});

test("wishlist validation requires a product UUID and safe return path", () => {
  assert.equal(
    wishlistSchemas.wishlistMutationSchema.safeParse({
      productId: "30000000-0000-4000-8000-000000000101",
      returnPath: "/shop",
    }).success,
    true,
  );
  assert.equal(
    wishlistSchemas.wishlistMutationSchema.safeParse({
      productId: "../admin",
      returnPath: "https://example.com",
    }).success,
    false,
  );
});

test("address validation enforces Tamil Nadu customer address basics", () => {
  const valid = addressSchemas.addressMutationSchema.safeParse({
    addressLine1: "12 Market Street",
    city: "Chennai",
    district: "Chennai",
    fullName: "Customer One",
    isDefault: true,
    label: "Home",
    phone: "9876543210",
    postalCode: "600001",
    returnPath: "/checkout",
    state: "Kerala",
  });

  assert.equal(valid.success, true);
  assert.equal(valid.data.state, "Tamil Nadu");

  const invalid = addressSchemas.addressMutationSchema.safeParse({
    addressLine1: "",
    city: "",
    district: "",
    fullName: "Customer One",
    label: "Home",
    phone: "12345",
    postalCode: "abc",
    returnPath: "https://example.com",
    state: "Tamil Nadu",
  });

  assert.equal(invalid.success, false);
});

test("checkout validation requires UPI reference only for UPI orders", () => {
  assert.equal(
    checkoutSchemas.checkoutSubmissionSchema.safeParse({
      addressId: "30000000-0000-4000-8000-000000000301",
      idempotencyKey: "phase5-idempotency-key",
      paymentMethod: "cod",
    }).success,
    true,
  );

  assert.equal(
    checkoutSchemas.checkoutSubmissionSchema.safeParse({
      addressId: "30000000-0000-4000-8000-000000000301",
      idempotencyKey: "phase5-idempotency-key",
      paymentMethod: "upi",
      upiReference: "UPI123456",
    }).success,
    true,
  );

  assert.equal(
    checkoutSchemas.checkoutSubmissionSchema.safeParse({
      addressId: "30000000-0000-4000-8000-000000000301",
      idempotencyKey: "phase5-idempotency-key",
      paymentMethod: "upi",
      upiReference: "",
    }).success,
    false,
  );
});

test("admin product and variant validation rejects unsafe catalog edits", () => {
  assert.equal(
    adminSchemas.adminProductSchema.safeParse({
      categoryId: "30000000-0000-4000-8000-000000000001",
      name: "Admin Product",
      slug: "admin-product",
      status: "active",
    }).success,
    true,
  );

  assert.equal(
    adminSchemas.adminProductSchema.safeParse({
      categoryId: "30000000-0000-4000-8000-000000000001",
      name: "Admin Product",
      slug: "../bad",
      status: "published",
    }).success,
    false,
  );

  assert.equal(
    adminSchemas.adminVariantSchema.safeParse({
      isActive: true,
      name: "Variant",
      price: 10,
      productId: "30000000-0000-4000-8000-000000000101",
      stockQuantity: -1,
      trackInventory: true,
    }).success,
    false,
  );
});

test("admin order and settings validation protects operational fields", () => {
  assert.equal(
    adminSchemas.adminOrderUpdateSchema.safeParse({
      orderId: "30000000-0000-4000-8000-000000000401",
      paymentStatus: "paid",
      status: "confirmed",
      trackingUrl: "https://example.test/track",
    }).success,
    true,
  );
  assert.equal(
    adminSchemas.adminOrderUpdateSchema.safeParse({
      orderId: "30000000-0000-4000-8000-000000000401",
      trackingUrl: "javascript:alert(1)",
    }).success,
    false,
  );
  assert.equal(
    adminSchemas.adminSettingsSchema.safeParse({
      businessName: "PME Green",
      shippingDefaultCharge: 40,
    }).success,
    true,
  );
});
