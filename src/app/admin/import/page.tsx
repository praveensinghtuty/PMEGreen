import { AdminShell } from "@/components/layout/admin-shell";
import { CatalogImportForm } from "@/features/admin/import/import-form";
import { requireAdmin } from "@/features/auth/queries/current-user";

export const metadata = {
  title: "Admin Catalog Import",
  robots: { index: false, follow: false },
};

export default async function AdminImportPage() {
  await requireAdmin("/admin/import");

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Catalog import</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Validate and preview catalog CSV files before running an atomic
          import. Phase 7A does not import the supplied real catalog
          automatically.
        </p>
        <CatalogImportForm />
      </div>
    </AdminShell>
  );
}
