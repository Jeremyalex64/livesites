import type { SanityImageSource } from "./image";

export type PortableTextEntry = {
  _key?: string;
  _type: string;
  [key: string]: unknown;
};

export type BlogAuthor = {
  name: string;
  slug?: string;
  bio?: string;
  image?: SanityImageSource;
  imageAlt?: string;
};

export type BlogCategory = {
  _id: string;
  title: string;
  slug?: string;
};

export type BlogPostSummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  authorName: string;
  author?: BlogAuthor | null;
  categories?: BlogCategory[];
  publishedAt: string;
  coverImage?: SanityImageSource;
  coverImageAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seoImage?: SanityImageSource;
  seoImageAlt?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  typography?: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
  };
};

export type BlogPost = BlogPostSummary & {
  body: PortableTextEntry[];
  _updatedAt?: string;
};
