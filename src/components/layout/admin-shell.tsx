import {
  FolderTree,
  Home,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  Users,
  Images,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/banners", label: "Banners", icon: Images },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background text-foreground lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-border bg-muted lg:min-h-svh lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center justify-between gap-3 px-4 lg:h-auto lg:flex-col lg:items-start lg:py-6">
          <Link
            className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            href="/"
          >
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Home aria-hidden="true" className="size-4" />
            </span>
            <span className="font-semibold">PME Admin</span>
          </Link>
          <nav aria-label="Admin navigation" className="hidden w-full lg:block">
            <ul className="mt-8 grid gap-1">
              {adminLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    href={link.href}
                  >
                    <link.icon aria-hidden="true" className="size-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-border bg-background">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-muted-foreground">
              Owner administration
            </p>
            <Link
              className="rounded-md text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              href="/"
            >
              Storefront
            </Link>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
