"use client";

import Image from "next/image";
import { useState } from "react";

import type { CatalogImage } from "@/features/catalog/types/catalog";
import { placeholderAssets } from "@/lib/placeholders/content";
import { cn } from "@/lib/utils/cn";

export function ProductGallery({
  images,
  productName,
}: {
  images: CatalogImage[];
  productName: string;
}) {
  const fallback = {
    id: "placeholder",
    alt: `${productName} placeholder image`,
    isPrimary: true,
    sortOrder: 0,
    src: placeholderAssets.product,
  };
  const galleryImages = images.length > 0 ? images : [fallback];
  const [selectedImageId, setSelectedImageId] = useState(galleryImages[0].id);
  const selectedImage =
    galleryImages.find((image) => image.id === selectedImageId) ??
    galleryImages[0];

  return (
    <section aria-label={`${productName} images`}>
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted shadow-sm">
        <Image
          alt={selectedImage.alt}
          className="object-cover"
          fill
          priority
          sizes="(min-width: 1280px) 520px, (min-width: 1024px) 45vw, 100vw"
          src={selectedImage.src}
        />
      </div>
      {galleryImages.length > 1 ? (
        <div
          className="mt-3 flex gap-2"
          role="list"
          aria-label="Product images"
        >
          {galleryImages.map((image) => (
            <button
              aria-label={`Show ${image.alt}`}
              aria-pressed={image.id === selectedImage.id}
              className={cn(
                "relative size-16 overflow-hidden rounded-md border bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                image.id === selectedImage.id
                  ? "border-primary"
                  : "border-border",
              )}
              key={image.id}
              onClick={() => setSelectedImageId(image.id)}
              type="button"
            >
              <Image alt="" className="object-cover" fill src={image.src} />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
