import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { author } from "./sanity/schemas/author";
import { category } from "./sanity/schemas/category";
import { post } from "./sanity/schemas/post";
import { textStyle } from "./sanity/schemas/text-style";
import { youtubeVideo } from "./sanity/schemas/youtube-video";
import { adSlot } from "./sanity/schemas/ad-slot";

export default defineConfig({
  name: "sitepulse",
  title: "Sitepulse Studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "rka0syp5",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  basePath: "/studio",
  plugins: [structureTool()],
  schema: {
    types: [post, author, category, textStyle, youtubeVideo, adSlot],
  },
});
