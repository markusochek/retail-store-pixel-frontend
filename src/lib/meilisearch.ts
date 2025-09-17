import { MeiliSearch } from 'meilisearch';

export const meilisearchClient = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY,
});

export const meilisearchAdminClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_MASTER_KEY,
});

export const productsIndex = meilisearchClient.index('products');
export const productsIndexAdmin = meilisearchAdminClient.index('products');
