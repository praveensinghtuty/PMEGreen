import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/config/env";

export default function robots(): MetadataRoute.Robots {
  const host = getSiteUrl();

  return {
    rules: [
      {
        allow: [
          "/",
          "/shop",
          "/categories",
          "/products",
          "/search",
          "/about",
          "/contact",
        ],
        disallow: [
          "/account",
          "/addresses",
          "/admin",
          "/cart",
          "/checkout",
          "/orders",
          "/wishlist",
          "/auth",
        ],
        userAgent: "*",
      },
    ],
    sitemap: `${host.replace(/\/$/, "")}/sitemap.xml`,
  };
}
