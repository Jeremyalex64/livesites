This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment variables

Local values are stored in `.env.local` and are ignored by git. `.env.example`
lists the variables used by the app:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SITE_URL`

The project ID and dataset are public Sanity configuration, not API credentials.
Never put a Sanity write token in a `NEXT_PUBLIC_` variable.

## Cloudflare Workers

This app uses the OpenNext Cloudflare adapter. Run the site normally during
development with `npm run dev`. To build and test it in the Workers runtime,
run `npm run preview`. Deploy with `npm run deploy` after authenticating
Wrangler with your Cloudflare account.

For Cloudflare Workers Builds, set the build variables
`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and
`NEXT_PUBLIC_SITE_URL` in the Cloudflare dashboard. The site URL must be the
canonical production origin, such as `https://www.example.com`. Also set these
values as Worker runtime variables when prompted/configured. `.env.local` is
local-only and is not uploaded to Cloudflare.

Add your local and production site origins to the Sanity project's CORS
allowlist so Studio authentication and browser-side Sanity requests can work.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
