import { NextRequest, NextResponse } from 'next/server';
import { productsIndexAdmin } from '@/lib/meilisearch';
import loggerServer from '@/lib/logger/logger-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5');
    const category = searchParams.get('category');
    const maxPrice = searchParams.get('maxPrice');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const filters = [];
    if (category) {
      filters.push(`category_name = "${category}"`);
    }
    if (maxPrice) {
      filters.push(`sale_price <= ${maxPrice}`);
    }

    const filterString = filters.length > 0 ? filters.join(' AND ') : undefined;

    const results = await productsIndexAdmin.search(query, {
      attributesToRetrieve: ['id', 'name', 'sale_price', 'category_name', 'images'],
      attributesToHighlight: ['name', 'description'],
      limit,
      filter: filterString,
      attributesToCrop: ['description'],
      cropLength: 20,
      showMatchesPosition: true,
    });

    return NextResponse.json(results);
  } catch (error) {
    loggerServer.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
