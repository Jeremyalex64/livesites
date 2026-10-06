import { PlayIcon } from "@sanity/icons/Play";
import { defineField, defineType } from "sanity";

function isYouTubeUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const videoId =
      host === "youtu.be"
        ? url.pathname.split("/")[1]
        : url.searchParams.get("v") ||
          url.pathname.split("/").filter(Boolean).at(-1);

    return (
      [
        "youtube.com",
        "m.youtube.com",
        "youtube-nocookie.com",
        "youtu.be",
      ].includes(host) &&
      Boolean(videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId))
    );
  } catch {
    return false;
  }
}

export const youtubeVideo = defineType({
  name: "youtubeVideo",
  title: "YouTube video",
  type: "object",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "url",
      title: "YouTube URL",
      type: "url",
      description: "Paste a YouTube watch, short, or youtu.be link.",
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            !value || isYouTubeUrl(value)
              ? true
              : "Enter a valid YouTube video URL.",
          ),
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
  ],
  preview: {
    select: { title: "caption", subtitle: "url" },
    prepare({ title, subtitle }) {
      return { title: title || "YouTube video", subtitle };
    },
  },
});
