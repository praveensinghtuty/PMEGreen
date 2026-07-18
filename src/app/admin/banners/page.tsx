import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import {
  deleteBannerAction,
  saveBannerAction,
} from "@/features/admin/actions/admin";
import { AdminNotice } from "@/features/admin/components/admin-notice";
import { getAdminBanners } from "@/features/admin/queries/banners";

export const metadata = {
  title: "Admin Banners",
  robots: { index: false, follow: false },
};

export default async function AdminBannersPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = (await searchParams) ?? {};
  const banners = await getAdminBanners();

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Banners</h1>
        <AdminNotice
          error={singleParam(params.adminError)}
          success={singleParam(params.adminSuccess)}
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_24rem]">
          <section className="space-y-3">
            {banners.map((banner) => (
              <article
                className="rounded-lg border border-border bg-card p-4 shadow-sm"
                key={banner.id}
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{banner.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {banner.is_active ? "active" : "hidden"} &middot;{" "}
                      {banner.link_type}
                    </p>
                  </div>
                  <form action={deleteBannerAction}>
                    <input name="id" type="hidden" value={banner.id} />
                    <Button size="sm" type="submit" variant="ghost">
                      Delete
                    </Button>
                  </form>
                </div>
                <details className="mt-4 rounded-md border border-border p-3">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Edit
                  </summary>
                  <BannerForm banner={banner} />
                </details>
              </article>
            ))}
          </section>
          <aside>
            <h2 className="mb-3 text-lg font-semibold">Create banner</h2>
            <BannerForm />
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}

function BannerForm({
  banner,
}: {
  banner?: Awaited<ReturnType<typeof getAdminBanners>>[number];
}) {
  return (
    <form action={saveBannerAction} className="mt-4 grid gap-3 text-sm">
      <input name="id" type="hidden" value={banner?.id ?? ""} />
      <Field defaultValue={banner?.title} label="Title" name="title" />
      <Field
        defaultValue={banner?.subtitle ?? ""}
        label="Subtitle"
        name="subtitle"
        required={false}
      />
      <Field
        defaultValue={banner?.image_path}
        label="Image path"
        name="imagePath"
      />
      <label className="grid gap-2 font-medium">
        Link type
        <select
          className="h-10 rounded-md border border-input bg-background px-3"
          defaultValue={banner?.link_type ?? "none"}
          name="linkType"
        >
          <option value="none">None</option>
          <option value="product">Product</option>
          <option value="category">Category</option>
          <option value="external">External</option>
        </select>
      </label>
      <Field
        defaultValue={banner?.link_value ?? ""}
        label="Link value"
        name="linkValue"
        required={false}
      />
      <Field
        defaultValue={String(banner?.sort_order ?? 0)}
        label="Sort order"
        name="sortOrder"
        type="number"
      />
      <label className="flex items-center gap-2 font-medium">
        <input
          defaultChecked={banner?.is_active ?? true}
          name="isActive"
          type="checkbox"
        />
        Active
      </label>
      <Button type="submit">{banner ? "Save banner" : "Create banner"}</Button>
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

function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
