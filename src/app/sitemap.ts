import { MetadataRoute } from "next";
import { query } from "@/lib/azure/postgres";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://useplugr.app";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let providerPages: MetadataRoute.Sitemap = [];
  try {
    const result = await query<{ id: string; updated_at: Date }>(
      `SELECT id, updated_at FROM student_profiles WHERE id IS NOT NULL ORDER BY updated_at DESC LIMIT 500`
    );
    providerPages = result.rows.map((row) => ({
      url: `${baseUrl}/discover/provider/${row.id}`,
      lastModified: new Date(row.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // If query fails, just return static pages
  }

  return [...staticPages, ...providerPages];
}
