import type { LucideIcon } from "lucide-react";
import { PackageSearch } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export function EmptyState({
  action,
  description,
  icon: Icon = PackageSearch,
  title,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted p-6 text-center sm:p-8">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-background text-primary">
        <Icon aria-hidden="true" className="size-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
