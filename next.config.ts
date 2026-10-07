// import type { NextConfig } from "next";
// import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// const nextConfig: NextConfig = {
//   images: {
//     unoptimized: true,
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "cdn.sanity.io",
//       },
//     ],
//   },
// };

// initOpenNextCloudflareForDev();

// export default nextConfig;
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  serverExternalPackages: ["swr"],
};

initOpenNextCloudflareForDev();

export default nextConfig;
