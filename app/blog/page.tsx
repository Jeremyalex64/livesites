import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedPosts } from "@/sanity/lib/posts";
import { imageUrl } from "@/sanity/lib/image";

export const metadata: Metadata = {
  title: "Website Guides & Insights | Sitepulse Blog",
  description:
    "Practical guides to website uptime, outages, DNS, and troubleshooting from Sitepulse.",
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="blog-shell">
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
          <Link href="/blog" aria-current="page">
            Blog
          </Link>
        </nav>
      </header>

      <div className="blog-content">
        <section className="blog-intro">
          <p className="blog-eyebrow">SITEPULSE / JOURNAL</p>
          <h1>Understand what keeps a website online.</h1>
          <p>
            Clear, practical advice for website owners when a site slows down,
            stops responding, or acts unexpectedly.
          </p>
        </section>

        {posts.length ? (
          <section className="blog-grid" aria-label="Published articles">
            {posts.map((post) => (
              <article className="blog-card" key={post._id}>
                <Link
                  className="blog-card-link"
                  href={`/${post.slug}`}
                  aria-label={`Read ${post.title}`}
                >
                  {post.coverImage && (
                    <div className="blog-card-image">
                      <Image
                        src={imageUrl(post.coverImage, 760, 428)}
                        alt={post.coverImageAlt || ""}
                        fill
                        sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="blog-card-copy">
                    <p className="blog-card-date">
                      {dateFormatter.format(new Date(post.publishedAt))}
                      <span>{post.author?.name || post.authorName}</span>
                    </p>
                    <h2>{post.title}</h2>
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                    {!!post.categories?.length && (
                      <div className="blog-card-categories">
                        {post.categories.map((category) => (
                          <span key={category._id}>{category.title}</span>
                        ))}
                      </div>
                    )}
                    {post.author?.image && (
                      <span className="blog-card-author">
                        <Image
                          src={imageUrl(post.author.image, 28, 28)}
                          alt={post.author.imageAlt || post.author.name}
                          width={28}
                          height={28}
                        />
                        {post.author.name}
                      </span>
                    )}
                    <span className="blog-read-link">
                      Read article <span aria-hidden="true">↗</span>
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </section>
        ) : (
          <section className="blog-empty">
            <span className="blog-empty-mark" aria-hidden="true">
              +
            </span>
            <h2>No articles published yet</h2>
            <p>Published posts will appear here.</p>
          </section>
        )}

        <footer className="blog-footer">
          <span>© {new Date().getFullYear()} Sitepulse</span>
          <Link href="/">
            Check a website <span aria-hidden="true">↗</span>
          </Link>
        </footer>
      </div>
    </main>
  );
}
