This is a [Next.js](https://nextjs.org) project bootstrapped with [
`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically
optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions
are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use
the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for
more details.

## Setup Meilisearch and run Meilisearch

1. curl -L https://install.meilisearch.com | sh
2. ./meilisearch --master-key default-master-key

## Settings Meilisearch

1. run Meilisearch
2. through POSTMAN:
   POST http://127.0.0.1:7700/keys
   {
   "name": "Frontend Search Key",
   "description": "Public key for frontend search operations",
   "actions": ["search"],
   "indexes": ["products"],
   "expiresAt": null
   }
3. copy key from response and paste .env.local NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY

## Check Meilisearch

1. curl -X GET "http://127.0.0.1:7700/indexes/products/documents?limit=5" \
   -H "Authorization: Bearer default-master-key"

## Prisma

1. npx prisma db seed
2. npx prisma db pull
3. npx prisma db push
4. npx prisma generate
