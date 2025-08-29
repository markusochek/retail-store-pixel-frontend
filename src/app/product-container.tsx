import React from 'react';
import ProductBlock from '@/app/product-block';
import { prisma } from '@/app/lib/db/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

const ProductContainer = async () => {
  const products = await prisma.products.findMany({
    include: { images: true },
  });
  products.sort((a, b) => Number(a.id_from_another_db - b.id_from_another_db));

  const session = await getServerSession(authOptions);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[2%] gap-y-[0.5%] p-[2%] bg-white rounded-4xl">
      {products.map(product => (
        <ProductBlock
          key={product.id}
          id={product.id}
          idFromAnotherDb={product.id_from_another_db}
          name={product.name}
          salePrice={product.sale_price.toNumber()}
          images={product.images}
          isAdmin={session ? session.user.role === 'ADMIN' : false}
        />
      ))}
    </div>
  );
};

export default ProductContainer;
