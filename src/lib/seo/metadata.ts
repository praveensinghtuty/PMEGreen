import { getSiteUrl } from "@/lib/config/env";

export function absoluteUrl(path: string) {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${siteUrl}${normalizedPath}`;
}

export function canonicalMetadata(path: string) {
  return {
    alternates: {
      canonical: absoluteUrl(path),
    },
  };
}
