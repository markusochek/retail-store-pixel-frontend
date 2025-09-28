'use client';

import React, { useEffect, useState } from 'react';
import ProductBlock from '@/app/[locale]/components/components-product-container/ProductBlock';
import { Decimal } from '@prisma/client/runtime/library';
import { Hits } from 'meilisearch';

interface Product {
  id: number;
  name: string;
  sale_price: Decimal;
  quantity: number;
  description: string | null;
  category_id: number;
  images: { id: number; path_to_image: string; product_id: number }[];
  isFavorite: boolean;
}

const ProductContainerClient = ({
  isEntrance,
  isAdmin,
  products,
}: {
  isEntrance: boolean;
  isAdmin: boolean;
  products: Product[] | Hits;
}) => {
  const [processedProducts, setProcessedProducts] = useState<Product[]>([]);

  useEffect(() => {
    let updatedProducts = [...products] as Product[];

    if (!isEntrance) {
      const favoritesFromStorage = localStorage.getItem('favorites');
      if (favoritesFromStorage) {
        const favorites = JSON.parse(favoritesFromStorage);
        updatedProducts = updatedProducts.map(product => ({
          ...product,
          isFavorite: favorites.includes(product.id),
        }));
      }
    }

    setProcessedProducts(updatedProducts);
  }, [products, isEntrance]);

  // Если продукты еще не обработаны, показываем скелетон
  if (processedProducts.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6 bg-gray-50 rounded-2xl">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6 bg-gray-50 rounded-2xl">
      {processedProducts.map(product => (
        <ProductBlock
          key={product.id}
          id={product.id}
          name={product.name}
          quantity={product.quantity}
          salePrice={parseFloat(product.sale_price.toString())}
          images={product.images || []}
          isFavoriteInitialization={product.isFavorite}
          isEntrance={isEntrance}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};

export default ProductContainerClient;
