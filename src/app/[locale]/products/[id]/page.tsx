import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import ProductImageGallery from '@/app/[locale]/products/[id]/components/ProductImageGallery';
import loggerServer from '@/lib/logger/logger-server';
import React from 'react';
import AddToCartButton from '@/app/[locale]/components/components-product-container/components-product-container-client/compoments-product-block/AddToCartButton';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  const { id } = await params;
  const productId = id;
  let product;
  try {
    product = await prisma.products.findUnique({
      where: { id: Number(productId) },
      include: {
        images: true,
        categories: true,
      },
    });
  } catch (error) {
    loggerServer.error('Error fetching product:', error, {
      productId: productId.toString(),
    });
    return null;
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="relative">
          <ProductImageGallery images={product.images} />
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-emerald-600">
              {product.sale_price.toString()}₽
            </div>
            {product.quantity > 0 ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {product.quantity} шт
              </span>
            ) : (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                Нет в наличии
              </span>
            )}
          </div>

          <div className="text-sm text-gray-500">Код: {product.id.toString()}</div>

          {product.categories && (
            <div className="text-sm text-gray-600">
              Категория: <span className="font-medium">{product.categories.name}</span>
            </div>
          )}

          {product.description && (
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Описание</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          <AddToCartButton
            productId={product.id}
            isEntrance={!!session}
            maxQuantity={product.quantity}
            className="mt-auto"
          />
        </div>
      </div>
    </div>
  );
}
