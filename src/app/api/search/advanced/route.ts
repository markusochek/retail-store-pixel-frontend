// app/api/search/advanced/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { productsIndexAdmin } from '@/lib/meilisearch';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const sortBy = searchParams.get('sortBy');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Строим фильтры
    const filters = [];
    if (category) filters.push(`category_name = "${category}"`);
    if (maxPrice) filters.push(`sale_price <= ${maxPrice}`);
    if (inStock === 'true') filters.push('quantity > 0');

    const filterString = filters.length > 0 ? filters.join(' AND ') : undefined;

    // Настройки сортировки
    let sort: string[] = [];
    switch (sortBy) {
      case 'price_asc':
        sort = ['sale_price:asc'];
        break;
      case 'price_desc':
        sort = ['sale_price:desc'];
        break;
      case 'name_asc':
        sort = ['name:asc'];
        break;
      case 'name_desc':
        sort = ['name:desc'];
        break;
      case 'popular':
        sort = ['popularity:desc'];
        break;
      default:
        sort = []; // Meilisearch сам решит по rankingRules
    }

    const results = await productsIndexAdmin.search(query, {
      attributesToRetrieve: [
        'id',
        'name',
        'sale_price',
        'category_name',
        'images',
        'quantity',
        'popularity',
      ],
      attributesToHighlight: ['name', 'description'],
      limit,
      offset: (page - 1) * limit,
      filter: filterString,
      sort,
      attributesToCrop: ['description'],
      cropLength: 30,
      showMatchesPosition: true,
      matchingStrategy: 'all', // 'all' или 'last'
    });

    return NextResponse.json({
      ...results,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(results.estimatedTotalHits / limit),
        totalHits: results.estimatedTotalHits,
      },
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
