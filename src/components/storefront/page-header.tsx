import type { ReactNode } from "react";

import { storefrontContainer } from "@/components/storefront/layout-classes";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({
  actions,
  description,
  eyebrow,
  title,
}: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-muted">
      <div
        className={`${storefrontContainer} flex flex-col gap-5 py-9 sm:py-10 lg:flex-row lg:items-end lg:justify-between`}
      >
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-secondary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </header>
  );
}
