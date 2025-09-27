'use client';

import React from 'react';
import ProductBlock from '@/app/[locale]/components/components-product-container/ProductBlock';
import { Decimal } from '@prisma/client/runtime/library';
import { Hits } from 'meilisearch';

const ProductContainerClient = ({
  products,
  isAdmin,
}: {
  products:
    | {
        id: number;
        name: string;
        sale_price: Decimal;
        quantity: number;
        description: string | null;
        category_id: number;
        images: { id: number; path_to_image: string; product_id: number }[];
        isFavorite: boolean;
      }[]
    | Hits;
  isAdmin: boolean;
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6 bg-gray-50 rounded-2xl">
      {products.map(product => (
        <ProductBlock
          key={product.id}
          id={product.id}
          name={product.name}
          quantity={product.quantity}
          salePrice={parseFloat(product.sale_price.toString())}
          isFavoriteInitialization={product.isFavorite}
          images={product.images || []}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};

export default ProductContainerClient;
