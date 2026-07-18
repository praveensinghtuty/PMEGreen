import {
  Boxes,
  ChartNoAxesColumnIncreasing,
  Image,
  Settings,
} from "lucide-react";

import { AdminShell } from "@/components/layout/admin-shell";
import { requireAdmin } from "@/features/auth/queries/current-user";

export const metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

const adminAreas = [
  {
    title: "Dashboard",
    description: "Actionable order and store summaries will appear here later.",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    title: "Catalog",
    description:
      "Product, category, variant, and image tools are out of scope for Phase 1.",
    icon: Boxes,
  },
  {
    title: "Banners",
    description:
      "Public content controls will be added after database and catalog foundations.",
    icon: Image,
  },
  {
    title: "Settings",
    description:
      "Business settings and replacement assets are documented placeholders for now.",
    icon: Settings,
  },
];

export default async function AdminPage() {
  await requireAdmin("/admin");

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
            Admin shell
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Owner workspace</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            This route is protected by server-side authentication and an admin
            role check. Management workflows continue in later phases.
          </p>
        </div>

        <section
          aria-label="Admin foundation areas"
          className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {adminAreas.map((area) => (
            <article
              className="rounded-lg border border-border bg-card p-5 shadow-sm"
              key={area.title}
            >
              <area.icon aria-hidden="true" className="size-6 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">{area.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {area.description}
              </p>
            </article>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}
