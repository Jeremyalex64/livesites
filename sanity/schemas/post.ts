import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { defineArrayMember, defineField, defineType } from "sanity";
import { fontFamilies, fontSizes, fontWeights } from "./style-options";

const reservedTopLevelSlugs = new Set([
  "api",
  "blog",
  "privacy",
  "studio",
  "terms",
]);

export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) =>
        rule.required().custom((value) => {
          const slug = value?.current;
          if (!slug) return true;
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            return "Use lowercase letters, numbers, and hyphens only.";
          }
          return reservedTopLevelSlugs.has(slug)
            ? "This slug is reserved for a site page."
            : true;
        }),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      description: "A short summary for search results and blog listings.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(180),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [
        defineArrayMember({ type: "reference", to: [{ type: "category" }] }),
      ],
      validation: (rule) => rule.min(1).max(3),
    }),
    defineField({
      name: "publishedAt",
      title: "Publish date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "typography",
      title: "Article typography",
      description:
        "Set the default style for the article body. Text selections can override these defaults.",
      type: "object",
      initialValue: {
        fontFamily: "manrope",
        fontSize: "17px",
        fontWeight: "400",
      },
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "fontFamily",
          title: "Font family",
          type: "string",
          options: {
            list: fontFamilies.map(({ title, value }) => ({ title, value })),
          },
        }),
        defineField({
          name: "fontSize",
          title: "Font size",
          type: "string",
          options: { list: [...fontSizes] },
        }),
        defineField({
          name: "fontWeight",
          title: "Font weight",
          type: "string",
          options: { list: [...fontWeights] },
        }),
      ],
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "coverImageAlt",
      title: "Cover image alt text",
      description: "Describe the image for accessibility and search engines.",
      type: "string",
      hidden: ({ document }) => !document?.coverImage,
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.coverImage && !value
            ? "Add alt text for the cover image."
            : true,
        ),
    }),
    defineField({
      name: "tags",
      title: "Topics",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "body",
      title: "Article body",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              defineArrayMember({ type: "textStyle" }),
              defineArrayMember({
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (rule) =>
                      rule
                        .required()
                        .uri({ scheme: ["http", "https", "mailto"] }),
                  }),
                ],
              }),
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        }),
        defineArrayMember({ type: "youtubeVideo" }),
        defineArrayMember({ type: "adSlot" }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "seo",
      title: "Search appearance",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "title",
          title: "SEO title",
          description:
            "Optional title for search results. Defaults to the post title.",
          type: "string",
          validation: (rule) => rule.max(60),
        }),
        defineField({
          name: "description",
          title: "SEO description",
          description: "Optional search summary. Defaults to the excerpt.",
          type: "text",
          rows: 3,
          validation: (rule) => rule.max(160),
        }),
        defineField({
          name: "keywords",
          title: "SEO keywords",
          description:
            "Relevant search topics; avoid repeating or stuffing keywords.",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
          options: { layout: "tags" },
          validation: (rule) => rule.max(10),
        }),
        defineField({
          name: "socialImage",
          title: "Social sharing image",
          description:
            "Optional Open Graph image. A 1200 × 630 image works well.",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "socialImageAlt",
          title: "Social image alt text",
          type: "string",
          hidden: ({ parent }) =>
            !(parent as { socialImage?: unknown } | undefined)?.socialImage,
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as
                { socialImage?: unknown } | undefined;
              return parent?.socialImage && !value
                ? "Add alt text for the social sharing image."
                : true;
            }),
        }),
        defineField({
          name: "canonicalUrl",
          title: "Canonical URL",
          description: "Leave blank to use this article's own URL.",
          type: "url",
          validation: (rule) => rule.uri({ scheme: ["https"] }),
        }),
        defineField({
          name: "noIndex",
          title: "Hide from search engines",
          type: "boolean",
          initialValue: false,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "excerpt",
      media: "coverImage",
    },
  },
});
