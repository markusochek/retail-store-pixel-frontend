// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { productsIndexAdmin } from '@/lib/meilisearch';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const q = searchParams.get('q') || '';
    const favoritesOnly = searchParams.get('favorites') === 'true';

    const session = await getServerSession(authOptions);
    let userFavoriteIds: number[] = [];

    if (session?.user?.id) {
      const favorites = await prisma.favorites.findMany({
        where: { user_id: Number(session.user.id) },
        select: { product_id: true },
      });
      userFavoriteIds = favorites.map(f => f.product_id);
    }

    let products: any[];
    let hasMore = false;
    let nextCursor: string | null = null;

    if (favoritesOnly) {
      // Режим избранного — только для авторизованных
      if (!session?.user?.id) {
        return NextResponse.json({ products: [], nextCursor: null, hasMore: false });
      }

      // Получаем ID избранных товаров
      const favs = await prisma.favorites.findMany({
        where: { user_id: Number(session.user.id) },
        select: { product_id: true },
      });
      const favoriteIds = favs.map(f => f.product_id);

      if (favoriteIds.length === 0) {
        return NextResponse.json({ products: [], nextCursor: null, hasMore: false });
      }

      // Пагинация по id избранных товаров
      const where: any = {
        id: { in: favoriteIds },
      };
      if (cursor) {
        where.id = { ...where.id, gt: parseInt(cursor) };
      }

      const items = await prisma.products.findMany({
        where,
        take: limit + 1,
        orderBy: { id: 'asc' },
        include: { images: true },
      });

      hasMore = items.length > limit;
      const data = hasMore ? items.slice(0, limit) : items;
      nextCursor = hasMore ? data[data.length - 1].id.toString() : null;

      products = data.map(product => ({
        ...product,
        sale_price: parseFloat(product.sale_price.toString()),
        isFavorite: true, // все элементы избранные
      }));
    } else {
      if (q) {
        // Режим поиска через Meilisearch
        const offset = (page - 1) * limit;
        const searchResults = await productsIndexAdmin.search(q, {
          attributesToRetrieve: ['id', 'name', 'sale_price', 'quantity', 'images'],
          limit: limit + 1, // запрашиваем на 1 больше для определения hasMore
          offset,
        });
        const hits = searchResults.hits;
        hasMore = hits.length > limit;
        products = hasMore ? hits.slice(0, limit) : hits;

        // Преобразуем к нужному формату и сортируем по id
        products = products
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            sale_price: p.sale_price,
            quantity: p.quantity,
            images: p.images || [],
            isFavorite: userFavoriteIds.includes(p.id),
          }))
          .sort((a: any, b: any) => a.id - b.id);

        // Для поиска nextCursor не используем (пагинация по page)
        nextCursor = null;
      } else {
        // Обычный режим – курсорная пагинация через Prisma
        const where: any = {};
        const cursorObj = cursor ? { id: parseInt(cursor) } : undefined;

        const items = await prisma.products.findMany({
          where,
          ...(cursorObj ? { cursor: cursorObj, skip: 1 } : {}),
          take: limit + 1,
          orderBy: { id: 'asc' },
          include: { images: true },
        });

        hasMore = items.length > limit;
        const data = hasMore ? items.slice(0, limit) : items;
        nextCursor = hasMore ? data[data.length - 1].id.toString() : null;

        products = data.map(product => ({
          ...product,
          sale_price: parseFloat(product.sale_price.toString()),
          isFavorite: userFavoriteIds.includes(product.id),
        }));
      }
    }

    return NextResponse.json({
      products,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
