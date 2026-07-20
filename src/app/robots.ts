import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/auth",
          "/login",
          "/register",
          "/dashboard",
          "/profile",
          "/settings",
          "/notifications",
          "/verification",
        ],
      },
    ],
    sitemap: "https://useplugr.app/sitemap.xml",
  };
}
