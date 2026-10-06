import { createImageUrlBuilder } from "@sanity/image-url";
import { client } from "./client";

const imageBuilder = createImageUrlBuilder(client);

export type SanityImageSource = Parameters<typeof imageBuilder.image>[0];

export function imageUrl(
  source: SanityImageSource,
  width: number,
  height?: number,
) {
  const builder = imageBuilder.image(source).width(width).auto("format");
  return (height ? builder.height(height).fit("crop") : builder).url();
}
