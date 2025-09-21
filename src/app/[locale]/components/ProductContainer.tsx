import React from 'react';
import ProductBlock from '@/app/[locale]/components/components-product-container/ProductBlock';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { productsIndexAdmin } from '@/lib/meilisearch';
import { prisma } from '@/lib/db/prisma';

const ProductContainer = async ({ initialSearchQuery }: { initialSearchQuery: string }) => {
  const session = await getServerSession(authOptions);

  let products;

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
    products.sort((a, b) => Number(a.id - b.id));
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6 bg-gray-50 rounded-2xl">
      {products.map(product => (
        <ProductBlock
          key={product.id}
          id={product.id}
          name={product.name}
          quantity={product.quantity}
          salePrice={parseFloat(product.sale_price.toString())}
          images={product.images || []}
          isAdmin={session ? session.user.role === 'ADMIN' : false}
        />
      ))}
    </div>
  );
};

export default ProductContainer;
