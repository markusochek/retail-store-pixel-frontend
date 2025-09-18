import React from 'react';
import ProductBlock from '@/app/[locale]/ProductBlock';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { productsIndexAdmin } from '@/lib/meilisearch';
import { prisma } from '@/lib/db/prisma';

const ProductContainer = async ({ initialSearchQuery }: { initialSearchQuery: string }) => {
  const session = await getServerSession(authOptions);

  let products;

  if (initialSearchQuery) {
    const searchResults = await productsIndexAdmin.search(initialSearchQuery, {
      attributesToRetrieve: [
        'id',
        'name',
        'sale_price',
        'images',
        'id_from_another_db',
        'quantity',
      ],
      limit: 100,
    });
    products = searchResults.hits;
  } else {
    products = await prisma.products.findMany({
      include: { images: true },
    });
    products.sort((a, b) => Number(a.id_from_another_db - b.id_from_another_db));
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6 bg-gray-50 rounded-2xl">
      {products.map(product => (
        <ProductBlock
          key={product.id}
          id={BigInt(product.id)}
          idFromAnotherDb={BigInt(product.id_from_another_db || product.id)}
          name={product.name}
          quantity={product.quantity}
          salePrice={
            typeof product.sale_price === 'number'
              ? product.sale_price
              : product.sale_price.toNumber()
          }
          images={product.images || []}
          isAdmin={session ? session.user.role === 'ADMIN' : false}
        />
      ))}
    </div>
  );
};

export default ProductContainer;
