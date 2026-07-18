import { Menu, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { placeholderCopy } from "@/lib/placeholders/content";

const storeLinks = [
  { href: "/", label: "Home" },
  { href: "/account", label: "Account" },
  { href: "/admin", label: "Admin" },
];

export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            href="/"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
              <ShoppingBag aria-hidden="true" className="size-5" />
            </span>
            <span className="truncate text-base font-semibold">
              {placeholderCopy.workingName}
            </span>
          </Link>

          <nav aria-label="Store navigation" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {storeLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button aria-label="Account" asChild size="icon" variant="ghost">
              <Link href="/account">
                <UserRound aria-hidden="true" className="size-5" />
              </Link>
            </Button>
            <Button
              aria-label="Menu placeholder"
              className="md:hidden"
              size="icon"
              type="button"
              variant="ghost"
            >
              <Menu aria-hidden="true" className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-border bg-muted">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>{placeholderCopy.workingName}</p>
          <p>Placeholder business details will be replaced later.</p>
        </div>
      </footer>
    </div>
  );
}
