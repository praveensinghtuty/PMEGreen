import Image from "next/image";
import Link from "next/link";

import { placeholderAssets } from "@/lib/placeholders/content";

type ProductCardProps = {
  name: string;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
  priceLabel?: string;
  categoryLabel?: string;
  variantSummary?: string;
  unavailable?: boolean;
};

export function ProductCard({
  categoryLabel,
  href,
  imageAlt,
  imageSrc = placeholderAssets.product,
  name,
  priceLabel,
  unavailable,
  variantSummary,
}: ProductCardProps) {
  return (
    <Link
      aria-disabled={unavailable}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      href={href}
    >
      <div className="relative aspect-square bg-muted">
        <Image
          alt={imageAlt ?? name}
          className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          src={imageSrc}
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        {categoryLabel ? (
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
            {categoryLabel}
          </p>
        ) : null}
        <h3 className="mt-1 text-base font-semibold leading-6">{name}</h3>
        {variantSummary ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {variantSummary}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-sm font-semibold text-primary">
            {priceLabel ?? "Price pending"}
          </p>
          {unavailable ? (
            <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              Unavailable
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
