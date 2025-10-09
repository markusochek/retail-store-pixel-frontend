import React from 'react';
import { productsIndexAdmin } from '@/lib/meilisearch';
import { prisma } from '@/lib/db/prisma';
import ProductContainerClient from '@/app/[locale]/components/components-product-container/ProductContainerClient';
import { Decimal } from '@prisma/client/runtime/library';
import { Hits } from 'meilisearch';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const ProductContainerFavorites = async ({
  initialSearchQuery,
}: {
  initialSearchQuery: string;
}) => {
  const session = await getServerSession(authOptions);

  let products:
    | {
        id: number;
        name: string;
        sale_price: Decimal;
        quantity: number;
        description: string | null;
        category_id: number;
        images: { id: number; path_to_image: string; product_id: number }[];
      }[]
    | Hits;

  if (initialSearchQuery) {
    const searchResults = await productsIndexAdmin.search(initialSearchQuery, {
      attributesToRetrieve: ['id', 'name', 'sale_price', 'images', 'quantity'],
      limit: 100,
    });
    products = searchResults.hits;
  } else {
    products = await prisma.products.findMany({
      include: { images: true },
    });
  }

  if (session && session.user && session.user.id) {
    const favorites = await prisma.favorites.findMany({
      where: {
        user_id: Number(session.user.id),
      },
      include: {
        products: true,
      },
    });

    products = products.map(product => {
      return {
        ...product,
        isFavorite: favorites.some(favorite => favorite.product_id === product.id),
      };
    });
  } else {
    products = products.map(product => {
      return {
        ...product,
        isFavorite: false,
      };
    });
  }
  products = products.filter(product => product.isFavorite);

  products = products.map(product => {
    return { ...product, sale_price: parseFloat(product.sale_price.toString()) };
  });
  products.sort((a, b) => Number(a.id - b.id));

  return products.length > 0 ? (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Избранное</h1>
          <ProductContainerClient
            isEntrance={!!session}
            isAdmin={session ? session.user.role === 'ADMIN' : false}
            products={products}
          ></ProductContainerClient>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Избранное</h1>
          <p className="text-gray-600">У вас пока нет избранных товаров</p>
        </div>
      </div>
    </div>
  );
};

export default ProductContainerFavorites;
