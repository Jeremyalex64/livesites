import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { notFound, permanentRedirect } from "next/navigation";
import { imageUrl } from "@/sanity/lib/image";
import { getPublishedPost } from "@/sanity/lib/posts";
import {
  fontFamilyCss,
  fontSizes,
  fontWeights,
} from "@/sanity/schemas/style-options";
import type { BlogPost, PortableTextEntry } from "@/sanity/lib/types";

const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

type ArticleImage = {
  _type: "image";
  asset?: { _ref: string };
  alt?: string;
  caption?: string;
};

type YouTubeValue = {
  url?: string;
  caption?: string;
};

type AdSlotValue = {
  format?: string;
  label?: string;
  adUnitId?: string;
};

type TextStyleValue = {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
};

function resolveTypography(style: TextStyleValue | undefined): CSSProperties {
  if (!style) return {};

  const fontSize = fontSizes.find(
    (option) => option.value === style.fontSize,
  )?.value;
  const fontWeight = fontWeights.find(
    (option) => option.value === style.fontWeight,
  )?.value;

  return {
    ...(style.fontFamily && fontFamilyCss[style.fontFamily]
      ? { fontFamily: fontFamilyCss[style.fontFamily] }
      : {}),
    ...(fontSize ? { fontSize } : {}),
    ...(fontWeight
      ? { fontWeight: Number(fontWeight) as CSSProperties["fontWeight"] }
      : {}),
  };
}

function getYouTubeId(value?: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (
      !(
        [
          "youtube.com",
          "m.youtube.com",
          "youtube-nocookie.com",
          "youtu.be",
        ] as string[]
      ).includes(host)
    ) {
      return null;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const videoId =
      host === "youtu.be"
        ? segments[0]
        : url.searchParams.get("v") || segments.at(-1);

    return videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

const adFormats = new Set(["in-article", "display", "multiplex"]);

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const image = value as ArticleImage;
      if (!image.asset?._ref) return null;

      return (
        <figure className="article-inline-figure">
          <div className="article-inline-image">
            <Image
              src={imageUrl(image, 1200, 675)}
              alt={image.alt || ""}
              fill
              sizes="(max-width: 760px) 100vw, 760px"
            />
          </div>
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
      );
    },
    youtubeVideo: ({ value }) => {
      const video = value as YouTubeValue;
      const videoId = getYouTubeId(video.url);
      if (!videoId) return null;

      return (
        <figure className="article-video-figure">
          <div className="article-video-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
              title={video.caption || "YouTube video"}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          {video.caption && <figcaption>{video.caption}</figcaption>}
        </figure>
      );
    },
    adSlot: ({ value }) => {
      const slot = value as AdSlotValue;
      const format =
        slot.format && adFormats.has(slot.format) ? slot.format : "in-article";

      return (
        <aside
          className={`article-ad-slot article-ad-${format}`}
          aria-label="Advertisement"
          data-ad-format={format}
          data-ad-unit={slot.adUnitId || undefined}
        >
          <span>ADVERTISEMENT</span>
          {slot.label && <strong>{slot.label}</strong>}
        </aside>
      );
    },
  },
  marks: {
    textStyle: ({ children, value }) => (
      <span style={resolveTypography(value as TextStyleValue | undefined)}>
        {children}
      </span>
    ),
  },
};

async function loadPost(slug: string): Promise<BlogPost | null> {
  try {
    return await getPublishedPost(slug);
  } catch (error) {
    console.error("Could not fetch a published Sitepulse post.", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: "Article not found | Sitepulse" };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const canonical =
    post.canonicalUrl || (siteUrl ? `${siteUrl}/${post.slug}` : undefined);
  const socialImage = post.seoImage || post.coverImage;
  const image = socialImage ? imageUrl(socialImage, 1200, 630) : undefined;

  return {
    title: `${title} | Sitepulse`,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: post.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      publishedTime: post.publishedAt,
      modifiedTime: post._updatedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: image
        ? [
            {
              url: image,
              alt: post.seoImageAlt || post.coverImageAlt || post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

async function BlogArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  permanentRedirect(`/${slug}`);
}

export default BlogArticlePage;

export async function RootBlogArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const portableText = post.body as PortableTextEntry[];
  const canonical =
    post.canonicalUrl ||
    (process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/${post.slug}`
      : undefined);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post._updatedAt || post.publishedAt,
    ...(canonical ? { mainEntityOfPage: canonical, url: canonical } : {}),
    ...(post.author?.name
      ? { author: { "@type": "Person", name: post.author.name } }
      : {}),
    ...(post.categories?.length
      ? { articleSection: post.categories.map((category) => category.title) }
      : {}),
    ...(post.seoKeywords?.length
      ? { keywords: post.seoKeywords.join(", ") }
      : {}),
    ...(post.seoImage || post.coverImage
      ? { image: imageUrl(post.seoImage || post.coverImage!, 1200, 630) }
      : {}),
  };

  return (
    <main className="article-shell">
      <header className="blog-header">
        <Link className="blog-brand" href="/" aria-label="Sitepulse home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>sitepulse</span>
        </Link>
        <nav className="blog-nav" aria-label="Main navigation">
          <Link href="/">Website checker</Link>
          <Link href="/blog">Blog</Link>
        </nav>
      </header>

      <article className="article-content">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <Link className="article-back-link" href="/blog">
          ← All articles
        </Link>
        <header className="article-header">
          <p className="blog-eyebrow">SITEPULSE / FIELD NOTES</p>
          <h1>{post.title}</h1>
          <p className="article-excerpt">{post.excerpt}</p>
          <div className="article-byline">
            {post.author?.image && (
              <Image
                className="article-author-image"
                src={imageUrl(post.author.image, 40, 40)}
                alt={post.author.imageAlt || post.author.name}
                width={40}
                height={40}
              />
            )}
            <span>{post.author?.name || post.authorName}</span>
            <time dateTime={post.publishedAt}>
              {dateFormatter.format(new Date(post.publishedAt))}
            </time>
          </div>
          {!!post.categories?.length && (
            <div className="article-categories" aria-label="Article categories">
              {post.categories.map((category) => (
                <span key={category._id}>{category.title}</span>
              ))}
            </div>
          )}
        </header>

        {post.coverImage && (
          <div className="article-cover-image">
            <Image
              src={imageUrl(post.coverImage, 1600, 900)}
              alt={post.coverImageAlt || ""}
              fill
              priority
              sizes="(max-width: 760px) 100vw, 960px"
            />
          </div>
        )}

        <div className="article-prose">
          <div
            className="article-prose"
            style={resolveTypography(post.typography)}
          >
            <PortableText
              components={portableTextComponents}
              value={portableText}
            />
          </div>
        </div>
        <footer className="article-footer">
          <p>Keep your site within reach.</p>
          <Link href="/">
            Check a website <span aria-hidden="true">↗</span>
          </Link>
        </footer>
      </article>
    </main>
  );
}
