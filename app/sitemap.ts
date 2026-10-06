import type { MetadataRoute } from "next";
import { getPublishedPostSlugs } from "@/sanity/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!siteUrl) return [];

  let posts: Array<{ slug: string; publishedAt: string }> = [];
  try {
    posts = await getPublishedPostSlugs();
  } catch (error) {
    console.error("Could not load blog slugs for the sitemap.", error);
  }

  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    ...posts.map((post) => ({
      url: `${siteUrl}/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
