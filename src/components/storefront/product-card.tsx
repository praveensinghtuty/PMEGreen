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
}: ProductCardProps) {
  return (
    <Link
      aria-disabled={unavailable}
      className="group block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      href={href}
    >
      <div className="relative aspect-square bg-muted">
        <Image
          alt={imageAlt ?? name}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          src={imageSrc}
        />
      </div>
      <div className="p-4">
        {categoryLabel ? (
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
            {categoryLabel}
          </p>
        ) : null}
        <h3 className="mt-1 text-base font-semibold">{name}</h3>
        <div className="mt-3 flex items-center justify-between gap-3">
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
