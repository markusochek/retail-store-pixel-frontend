## Getting Started

First, run the development server:

```bash
npm run dev
```

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

1. npx prisma db push / npx prisma db pull
3. npx prisma db seed
4. npx prisma generate
