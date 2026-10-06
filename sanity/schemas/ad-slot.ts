import { TagIcon } from "@sanity/icons/Tag";
import { defineField, defineType } from "sanity";

export const adSlot = defineType({
  name: "adSlot",
  title: "Advertisement placement",
  type: "object",
  icon: TagIcon,
  fields: [
    defineField({
      name: "format",
      title: "Ad format",
      type: "string",
      initialValue: "in-article",
      options: {
        list: [
          { title: "In-article", value: "in-article" },
          { title: "Display", value: "display" },
          { title: "Multiplex", value: "multiplex" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Internal label",
      description: "Helps identify this placement while editing.",
      type: "string",
    }),
    defineField({
      name: "adUnitId",
      title: "Ad unit ID",
      description: "Optional. Used after an ad provider is connected.",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "format" },
    prepare({ title, subtitle }) {
      return {
        title: title || "Advertisement placement",
        subtitle: subtitle || "In-article",
      };
    },
  },
});
