export const publishedPostsQuery = `
  *[
    _type == "post" &&
    defined(slug.current) &&
    defined(publishedAt) &&
    publishedAt <= now() &&
    seo.noIndex != true
  ] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "authorName": select(defined(author->_id) => author->name, author),
    "author": author->{
      name,
      "slug": slug.current,
      bio,
      image,
      imageAlt
    },
    "categories": categories[]->{_id, title, "slug": slug.current},
    publishedAt,
    coverImage,
    coverImageAlt,
    "seoTitle": seo.title,
    "seoDescription": seo.description,
    "seoKeywords": seo.keywords,
    "seoImage": seo.socialImage,
    "seoImageAlt": seo.socialImageAlt,
    "canonicalUrl": seo.canonicalUrl,
    "noIndex": coalesce(seo.noIndex, false)
  }
`;

export const publishedPostBySlugQuery = `
  *[
    _type == "post" &&
    slug.current == $slug &&
    defined(publishedAt) &&
    publishedAt <= now()
  ][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "authorName": select(defined(author->_id) => author->name, author),
    "author": author->{
      name,
      "slug": slug.current,
      bio,
      image,
      imageAlt
    },
    "categories": categories[]->{_id, title, "slug": slug.current},
    publishedAt,
    _updatedAt,
    body,
    typography,
    coverImage,
    coverImageAlt,
    "seoTitle": seo.title,
    "seoDescription": seo.description,
    "seoKeywords": seo.keywords,
    "seoImage": seo.socialImage,
    "seoImageAlt": seo.socialImageAlt,
    "canonicalUrl": seo.canonicalUrl,
    "noIndex": coalesce(seo.noIndex, false)
  }
`;

export const publishedPostSlugsQuery = `
  *[
    _type == "post" &&
    defined(slug.current) &&
    defined(publishedAt) &&
    publishedAt <= now() &&
    seo.noIndex != true
  ] {
    "slug": slug.current,
    publishedAt,
    _updatedAt
  }
`;
