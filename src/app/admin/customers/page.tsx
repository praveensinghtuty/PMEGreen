import { AdminShell } from "@/components/layout/admin-shell";
import { getAdminCustomers } from "@/features/admin/queries/customers";

export const metadata = {
  title: "Admin Customers",
  robots: { index: false, follow: false },
};

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Customers</h1>
        <div className="mt-6 grid gap-3">
          {customers.map((customer) => (
            <article
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
              key={customer.id}
            >
              <h2 className="font-semibold">
                {customer.full_name ??
                  customer.email ??
                  customer.phone ??
                  "Customer"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {customer.email ?? "No email"} &middot;{" "}
                {customer.phone ?? "No phone"} &middot;{" "}
                {customer.is_active ? "active" : "inactive"}
              </p>
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
