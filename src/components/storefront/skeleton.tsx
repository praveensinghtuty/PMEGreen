import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      role="presentation"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="mt-4 h-4 w-4/5" />
      <Skeleton className="mt-2 h-4 w-2/5" />
    </div>
  );
}
