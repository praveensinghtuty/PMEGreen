import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type SectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Section({
  children,
  className,
  contentClassName,
  description,
  eyebrow,
  title,
}: SectionProps) {
  return (
    <section className={cn("py-10 sm:py-14", className)}>
      <div
        className={cn(
          "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8",
          contentClassName,
        )}
      >
        {title ? (
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className={title ? "mt-6" : undefined}>{children}</div>
      </div>
    </section>
  );
}
