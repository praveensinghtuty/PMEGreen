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
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-5 w-4/5" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-4 h-4 w-2/5" />
      </div>
    </div>
  );
}
