import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/contact";

/** Crawl everything public; keep account, bag and checkout flows out of search. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/cart",
        "/checkout",
        "/profile",
        "/order-success",
        "/order-failure",
        "/sign-in",
        "/register",
        "/login",
        "/track-order",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
