import Link from "next/link";

import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import {
  deleteProductAction,
  deleteProductImageAction,
  saveProductAction,
  saveProductImageAction,
  saveVariantAction,
  toggleProductAction,
  uploadProductImageAction,
} from "@/features/admin/actions/admin";
import { AdminNotice } from "@/features/admin/components/admin-notice";
import {
  getAdminCategories,
  getAdminProducts,
} from "@/features/admin/queries/catalog";
import { adminSearchSchema } from "@/features/admin/schemas/admin";
import type { Tables } from "@/types/supabase";

type AdminProductItem = Awaited<
  ReturnType<typeof getAdminProducts>
>["products"][number];
type AdminCategory = Awaited<ReturnType<typeof getAdminCategories>>[number];
type AdminVariant = Tables<"product_variants">;
type AdminImage = Tables<"product_images">;

export const metadata = {
  title: "Admin Products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawParams = (await searchParams) ?? {};
  const params = adminSearchSchema.parse(rawParams);
  const status = ["active", "draft", "inactive"].includes(params.status)
    ? (params.status as "active" | "draft" | "inactive")
    : "all";
  const [catalog, categories] = await Promise.all([
    getAdminProducts({ page: params.page, query: params.q, status }),
    getAdminCategories(),
  ]);

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Products</h1>
        <AdminNotice
          error={singleParam(rawParams.adminError)}
          success={singleParam(rawParams.adminSuccess)}
        />
        <form className="mt-5 flex flex-wrap gap-3">
          <input
            className="h-11 rounded-md border border-input bg-background px-3"
            defaultValue={params.q}
            name="q"
            placeholder="Search products"
          />
          <select
            className="h-11 rounded-md border border-input bg-background px-3"
            defaultValue={status}
            name="status"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Hidden</option>
          </select>
          <Button type="submit">Filter</Button>
        </form>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_28rem]">
          <section className="space-y-4">
            {catalog.products.map((product) => (
              <article
                className="rounded-lg border border-border bg-card p-4 shadow-sm"
                key={product.id}
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{product.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {product.categoryName} · {product.status} · /
                      {product.slug}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/products/${product.slug}`}>Preview</Link>
                    </Button>
                    <form action={toggleProductAction}>
                      <input name="id" type="hidden" value={product.id} />
                      <input
                        name="status"
                        type="hidden"
                        value={
                          product.status === "active" ? "inactive" : "active"
                        }
                      />
                      <Button size="sm" type="submit" variant="outline">
                        {product.status === "active" ? "Hide" : "Show"}
                      </Button>
                    </form>
                    <form action={deleteProductAction}>
                      <input name="id" type="hidden" value={product.id} />
                      <Button size="sm" type="submit" variant="ghost">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
                <details className="mt-4 rounded-md border border-border p-3">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Edit product, variants, images
                  </summary>
                  <ProductForm categories={categories} product={product} />
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <h3 className="font-semibold">Variants</h3>
                      {product.variants.map((variant) => (
                        <VariantForm
                          key={variant.id}
                          productId={product.id}
                          variant={variant}
                        />
                      ))}
                      <VariantForm productId={product.id} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Images</h3>
                      {product.images.map((image) => (
                        <ImageForm
                          image={image}
                          key={image.id}
                          productId={product.id}
                        />
                      ))}
                      <ImageForm productId={product.id} />
                      <UploadImageForm productId={product.id} />
                    </div>
                  </div>
                </details>
              </article>
            ))}
            <div className="flex gap-3">
              {catalog.page > 1 ? (
                <Button asChild variant="outline">
                  <Link href={`/admin/products?page=${catalog.page - 1}`}>
                    Previous
                  </Link>
                </Button>
              ) : null}
              {catalog.page < catalog.totalPages ? (
                <Button asChild variant="outline">
                  <Link href={`/admin/products?page=${catalog.page + 1}`}>
                    Next
                  </Link>
                </Button>
              ) : null}
            </div>
          </section>
          <aside>
            <h2 className="mb-3 text-lg font-semibold">Create product</h2>
            <ProductForm categories={categories} />
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}

function ProductForm({
  categories,
  product,
}: {
  categories: AdminCategory[];
  product?: AdminProductItem;
}) {
  return (
    <form
      action={saveProductAction}
      className="mt-4 grid gap-3 rounded-lg border border-border bg-card p-4 text-sm shadow-sm"
    >
      <input name="id" type="hidden" value={product?.id ?? ""} />
      <Field defaultValue={product?.name} label="Name" name="name" />
      <Field defaultValue={product?.slug} label="Slug" name="slug" />
      <label className="grid gap-2 font-medium">
        Category
        <select
          className="h-10 rounded-md border border-input bg-background px-3"
          defaultValue={product?.category_id}
          name="categoryId"
          required
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 font-medium">
        Status
        <select
          className="h-10 rounded-md border border-input bg-background px-3"
          defaultValue={product?.status ?? "draft"}
          name="status"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="inactive">Hidden</option>
        </select>
      </label>
      <Field
        defaultValue={product?.short_description ?? ""}
        label="Short description"
        name="shortDescription"
        required={false}
      />
      <TextArea
        defaultValue={product?.description ?? ""}
        label="Description"
        name="description"
      />
      <TextArea
        defaultValue={product?.benefits ?? ""}
        label="Benefits"
        name="benefits"
      />
      <TextArea
        defaultValue={product?.ingredients ?? ""}
        label="Ingredients"
        name="ingredients"
      />
      <TextArea
        defaultValue={product?.usage_instructions ?? ""}
        label="Usage"
        name="usageInstructions"
      />
      <TextArea
        defaultValue={product?.storage_instructions ?? ""}
        label="Storage"
        name="storageInstructions"
      />
      <Field
        defaultValue={product?.shelf_life ?? ""}
        label="Shelf life"
        name="shelfLife"
        required={false}
      />
      <Field
        defaultValue={String(product?.sort_order ?? 0)}
        label="Sort order"
        name="sortOrder"
        type="number"
      />
      <label className="flex items-center gap-2">
        <input
          defaultChecked={product?.is_featured}
          name="isFeatured"
          type="checkbox"
        />{" "}
        Featured
      </label>
      <label className="flex items-center gap-2">
        <input
          defaultChecked={product?.is_bestseller}
          name="isBestseller"
          type="checkbox"
        />{" "}
        Bestseller
      </label>
      <Button type="submit">
        {product ? "Save product" : "Create product"}
      </Button>
    </form>
  );
}

function VariantForm({
  productId,
  variant,
}: {
  productId: string;
  variant?: AdminVariant;
}) {
  return (
    <form
      action={saveVariantAction}
      className="mt-3 grid gap-2 rounded-md border border-border p-3 text-sm"
    >
      <input name="id" type="hidden" value={variant?.id ?? ""} />
      <input name="productId" type="hidden" value={productId} />
      <Field
        defaultValue={variant?.name ?? ""}
        label="Variant name"
        name="name"
      />
      <Field
        defaultValue={variant?.sku ?? ""}
        label="SKU"
        name="sku"
        required={false}
      />
      <Field
        defaultValue={String(variant?.price ?? 0)}
        label="Price"
        name="price"
        type="number"
      />
      <Field
        defaultValue={String(variant?.stock_quantity ?? 0)}
        label="Stock"
        name="stockQuantity"
        type="number"
      />
      <Field
        defaultValue={variant?.value ? String(variant.value) : ""}
        label="Value"
        name="value"
        required={false}
        type="number"
      />
      <label className="grid gap-2 font-medium">
        Unit
        <select
          className="h-10 rounded-md border border-input bg-background px-3"
          defaultValue={variant?.unit ?? ""}
          name="unit"
        >
          <option value="">None</option>
          <option value="ml">ml</option>
          <option value="l">l</option>
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="piece">piece</option>
          <option value="pack">pack</option>
          <option value="other">other</option>
        </select>
      </label>
      <label>
        <input
          defaultChecked={variant?.track_inventory ?? true}
          name="trackInventory"
          type="checkbox"
        />{" "}
        Track inventory
      </label>
      <label>
        <input
          defaultChecked={variant?.is_active ?? true}
          name="isActive"
          type="checkbox"
        />{" "}
        Active
      </label>
      <label>
        <input
          defaultChecked={variant?.is_default}
          name="isDefault"
          type="checkbox"
        />{" "}
        Default
      </label>
      <Button size="sm" type="submit">
        {variant ? "Save variant" : "Add variant"}
      </Button>
    </form>
  );
}

function ImageForm({
  image,
  productId,
}: {
  image?: AdminImage;
  productId: string;
}) {
  return (
    <form
      action={image ? saveProductImageAction : saveProductImageAction}
      className="mt-3 grid gap-2 rounded-md border border-border p-3 text-sm"
    >
      <input name="id" type="hidden" value={image?.id ?? ""} />
      <input name="productId" type="hidden" value={productId} />
      <Field
        defaultValue={image?.storage_path ?? ""}
        label="Storage path"
        name="storagePath"
      />
      <Field
        defaultValue={image?.alt_text ?? ""}
        label="Alt text"
        name="altText"
        required={false}
      />
      <Field
        defaultValue={String(image?.sort_order ?? 0)}
        label="Sort order"
        name="sortOrder"
        type="number"
      />
      <label>
        <input
          defaultChecked={image?.is_primary}
          name="isPrimary"
          type="checkbox"
        />{" "}
        Primary image
      </label>
      <div className="flex gap-2">
        <Button size="sm" type="submit">
          {image ? "Save image" : "Add image"}
        </Button>
        {image ? (
          <button
            formAction={deleteProductImageAction}
            className="text-sm font-semibold text-destructive"
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}

function UploadImageForm({ productId }: { productId: string }) {
  return (
    <form
      action={uploadProductImageAction}
      className="mt-3 grid gap-2 rounded-md border border-border p-3 text-sm"
    >
      <input name="productId" type="hidden" value={productId} />
      <Field label="Alt text" name="altText" required={false} />
      <Field
        defaultValue="0"
        label="Sort order"
        name="sortOrder"
        type="number"
      />
      <label className="grid gap-2 font-medium">
        Upload image
        <input
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          name="image"
          required
          type="file"
        />
      </label>
      <label>
        <input name="isPrimary" type="checkbox" /> Primary image
      </label>
      <Button size="sm" type="submit">
        Upload image
      </Button>
    </form>
  );
}

function Field({
  defaultValue = "",
  label,
  name,
  required = true,
  type = "text",
}: {
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 font-medium">
      {label}
      <input
        className="h-10 rounded-md border border-input bg-background px-3"
        defaultValue={defaultValue}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function TextArea({
  defaultValue = "",
  label,
  name,
}: {
  defaultValue?: string;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2 font-medium">
      {label}
      <textarea
        className="min-h-20 rounded-md border border-input bg-background px-3 py-2"
        defaultValue={defaultValue}
        name={name}
      />
    </label>
  );
}

function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
