import { getSupabasePublicConfig } from "@/lib/config/env";

export function toPublicStorageUrl(
  bucket: "product-images" | "site-assets",
  path: string,
) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith("/")) {
    return path;
  }

  const config = getSupabasePublicConfig();

  if (!config) {
    return path;
  }

  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${config.url}/storage/v1/object/public/${bucket}/${encodedPath}`;
}
