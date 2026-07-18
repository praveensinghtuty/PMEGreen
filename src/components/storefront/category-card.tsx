import Image from "next/image";
import Link from "next/link";

import { placeholderAssets } from "@/lib/placeholders/content";

type CategoryCardProps = {
  name: string;
  description: string;
  href: string;
  imageSrc?: string;
};

export function CategoryCard({
  description,
  href,
  imageSrc = placeholderAssets.category,
  name,
}: CategoryCardProps) {
  return (
    <Link
      className="group block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      href={href}
    >
      <div className="relative aspect-[4/3] bg-muted">
        <Image
          alt=""
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          src={imageSrc}
        />
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold">{name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}
