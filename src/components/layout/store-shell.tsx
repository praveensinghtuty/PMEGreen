import {
  Grid2X2,
  Home,
  Info,
  Leaf,
  Mail,
  Search,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { placeholderCopy } from "@/lib/placeholders/content";

const storeLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/search", label: "Search" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const mobileLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/categories", label: "Categories", icon: Grid2X2 },
  { href: "/search", label: "Search", icon: Search },
  { href: "/account", label: "Account", icon: UserRound },
];

export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background pb-20 text-foreground md:pb-0">
      <div className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-center px-4 text-center text-xs font-medium sm:px-6 lg:px-8">
          <Leaf aria-hidden="true" className="mr-2 size-3.5 shrink-0" />
          Tamil Nadu delivery only for v1
        </div>
      </div>
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
            <Button
              aria-label="Search"
              asChild
              className="hidden sm:inline-flex"
              size="icon"
              variant="ghost"
            >
              <Link href="/search">
                <Search aria-hidden="true" className="size-5" />
              </Link>
            </Button>
            <Button aria-label="Account" asChild size="icon" variant="ghost">
              <Link href="/account">
                <UserRound aria-hidden="true" className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-border bg-muted">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
                <ShoppingBag aria-hidden="true" className="size-5" />
              </span>
              <p className="font-semibold">{placeholderCopy.workingName}</p>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              A storefront framework for a small Tamil Nadu traditional products
              business. Final business details and verified claims will replace
              placeholders later.
            </p>
          </div>
          <nav aria-label="Footer shop navigation">
            <h2 className="text-sm font-semibold">Shop</h2>
            <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground" href="/shop">
                  All products
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/categories">
                  Categories
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/search">
                  Search
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Footer company navigation">
            <h2 className="text-sm font-semibold">Store</h2>
            <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <li>
                <Link
                  className="inline-flex items-center gap-2 hover:text-foreground"
                  href="/about"
                >
                  <Info aria-hidden="true" className="size-4" />
                  About
                </Link>
              </li>
              <li>
                <Link
                  className="inline-flex items-center gap-2 hover:text-foreground"
                  href="/contact"
                >
                  <Mail aria-hidden="true" className="size-4" />
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
          Placeholder content. No product claims, reviews, or certifications are
          asserted.
        </div>
      </footer>

      <nav
        aria-label="Mobile storefront navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(37,32,25,0.08)] backdrop-blur md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobileLinks.map((link) => {
            const Icon = link.icon;

            return (
              <li key={link.href}>
                <Link
                  className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[0.7rem] font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  href={link.href}
                >
                  <Icon aria-hidden="true" className="size-5" />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
