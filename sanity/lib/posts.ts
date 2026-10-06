import { client } from "./client";
import {
  publishedPostBySlugQuery,
  publishedPostsQuery,
  publishedPostSlugsQuery,
} from "./queries";
import type { BlogPost, BlogPostSummary } from "./types";

export async function getPublishedPosts() {
  return client.fetch<BlogPostSummary[]>(
    publishedPostsQuery,
    {},
    { next: { revalidate: 300 } },
  );
}

export async function getPublishedPost(slug: string) {
  return client.fetch<BlogPost | null>(
    publishedPostBySlugQuery,
    { slug },
    { next: { revalidate: 300 } },
  );
}

export async function getPublishedPostSlugs() {
  return client.fetch<Array<{ slug: string; publishedAt: string }>>(
    publishedPostSlugsQuery,
    {},
    { next: { revalidate: 3600 } },
  );
}
