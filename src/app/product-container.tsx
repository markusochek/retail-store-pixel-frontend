import React from 'react';
import ProductBlock from '@/app/product-block';
import { prisma } from '@/app/lib/db/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { productsIndexAdmin } from '@/app/lib/meilisearch';

const ProductContainer = async ({ searchQuery }: { searchQuery: string }) => {
  const session = await getServerSession(authOptions);

  let products;

  if (searchQuery) {
    // Поиск через Meilisearch
    const searchResults = await productsIndexAdmin.search(searchQuery, {
      attributesToRetrieve: ['id', 'name', 'sale_price', 'images', 'id_from_another_db'],
      limit: 100,
    });
    products = searchResults.hits;
  } else {
    // Все товары из базы
    products = await prisma.products.findMany({
      include: { images: true },
    });
    products.sort((a, b) => Number(a.id_from_another_db - b.id_from_another_db));
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[2%] gap-y-[0.5%] p-[2%] bg-white rounded-4xl">
      {products.map((product: any) => (
        <ProductBlock
          key={product.id}
          id={BigInt(product.id)}
          idFromAnotherDb={BigInt(product.id_from_another_db || product.id)}
          name={product.name}
          salePrice={
            typeof product.sale_price === 'number'
              ? product.sale_price
              : product.sale_price.toNumber()
          }
          images={product.images || []}
          isAdmin={session ? session.user.role === 'ADMIN' : false}
        />
      ))}

      {searchQuery && products.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          Ничего не найдено по запросу "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default ProductContainer;
