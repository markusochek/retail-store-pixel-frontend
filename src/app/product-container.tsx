import React from 'react';
import ProductBlock from '@/app/product-block';

import { getImagePath } from '@/app/lib/helpers/images';
import { prisma } from '@/app/lib/db/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

const ProductContainer = async () => {
  const products = await prisma.products.findMany();
  products.sort((a, b) => Number(a.id_from_another_db - b.id_from_another_db));

  const session = await getServerSession(authOptions);
  return (
    <div
      className={
        'flex flex-row flex-wrap justify-center align-center bg-white rounded-4xl gap-[2%] p-[2%]'
      }
    >
      {products.map(product => (
        <ProductBlock
          key={product.id}
          id={product.id}
          idFromAnotherDb={product.id_from_another_db}
          name={product.name}
          salePrice={product.sale_price.toNumber()}
          pathToImage={getImagePath(product.path_to_image)}
          isAdmin={session ? session.user.role === 'ADMIN' : false}
        />
      ))}
    </div>
  );
};

export default ProductContainer;
