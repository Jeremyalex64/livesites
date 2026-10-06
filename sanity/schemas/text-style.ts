import { defineField, defineType } from "sanity";
import { fontFamilies, fontSizes, fontWeights } from "./style-options";

export const textStyle = defineType({
  name: "textStyle",
  title: "Text style",
  type: "object",
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
});
