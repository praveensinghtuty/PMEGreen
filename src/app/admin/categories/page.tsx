import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import {
  deleteCategoryAction,
  saveCategoryAction,
  toggleCategoryAction,
} from "@/features/admin/actions/admin";
import { AdminNotice } from "@/features/admin/components/admin-notice";
import { getAdminCategories } from "@/features/admin/queries/catalog";

export const metadata = {
  title: "Admin Categories",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = (await searchParams) ?? {};
  const categories = await getAdminCategories();

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Categories</h1>
        <AdminNotice
          error={singleParam(params.adminError)}
          success={singleParam(params.adminSuccess)}
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_24rem]">
          <section className="space-y-3">
            {categories.map((category) => (
              <article
                className="rounded-lg border border-border bg-card p-4 shadow-sm"
                key={category.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{category.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      /{category.slug} ·{" "}
                      {category.is_active ? "active" : "hidden"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleCategoryAction}>
                      <input name="id" type="hidden" value={category.id} />
                      <input
                        name="isActive"
                        type="hidden"
                        value={category.is_active ? "" : "on"}
                      />
                      <Button size="sm" type="submit" variant="outline">
                        {category.is_active ? "Hide" : "Show"}
                      </Button>
                    </form>
                    <form action={deleteCategoryAction}>
                      <input name="id" type="hidden" value={category.id} />
                      <Button size="sm" type="submit" variant="ghost">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
                <details className="mt-4 rounded-md border border-border p-3">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Edit
                  </summary>
                  <CategoryForm category={category} />
                </details>
              </article>
            ))}
          </section>
          <aside>
            <h2 className="mb-3 text-lg font-semibold">Create category</h2>
            <CategoryForm />
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}

function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function CategoryForm({
  category,
}: {
  category?: Awaited<ReturnType<typeof getAdminCategories>>[number];
}) {
  return (
    <form
      action={saveCategoryAction}
      className="mt-4 grid gap-3 rounded-lg border border-border bg-card p-4 text-sm shadow-sm"
    >
      <input name="id" type="hidden" value={category?.id ?? ""} />
      <Field defaultValue={category?.name} label="Name" name="name" />
      <Field defaultValue={category?.slug} label="Slug" name="slug" />
      <Field
        defaultValue={category?.description ?? ""}
        label="Description"
        name="description"
        required={false}
      />
      <Field
        defaultValue={category?.image_path ?? ""}
        label="Image path"
        name="imagePath"
        required={false}
      />
      <Field
        defaultValue={String(category?.sort_order ?? 0)}
        label="Sort order"
        name="sortOrder"
        type="number"
      />
      <label className="flex items-center gap-2 font-medium">
        <input
          defaultChecked={category?.is_active ?? true}
          name="isActive"
          type="checkbox"
        />
        Active
      </label>
      <Button type="submit">
        {category ? "Save category" : "Create category"}
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
