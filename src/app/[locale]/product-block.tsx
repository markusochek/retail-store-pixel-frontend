'use client';

import React, { useRef, useState } from 'react';
import ProductImageHoverArea from '@/app/components/ProductImageHoverArea';
import { useRouter } from 'next/navigation';

const ProductBlock = ({
  id,
  idFromAnotherDb,
  name,
  salePrice,
  quantity,
  isAdmin,
  images,
}: {
  id: bigint;
  idFromAnotherDb: bigint;
  name: string;
  salePrice: number;
  quantity: number;
  isAdmin: boolean;
  images: { id: bigint; path_to_image: string; product_id: bigint }[];
}) => {
  const [displayedImages, setDisplayedImages] = useState(images);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAdmin && e.button === 0 && e.ctrlKey) {
      e.preventDefault();
      fileInputRef.current?.click();
      return;
    }

    if (e.button === 0) {
      e.preventDefault();
      router.push(`/products/${id}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        if (!files[i].type.startsWith('image/')) {
          alert('Пожалуйста, выбирайте только файлы изображений!');
          continue;
        }
        formData.append('files', files[i]);
      }

      formData.append('productId', id.toString());

      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Ошибка загрузки файлов');
      }

      const data: {
        message: string;
        uploadedFiles: { id: bigint; path_to_image: string; product_id: bigint }[];
      } = await response.json();

      setDisplayedImages(data.uploadedFiles);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert(error instanceof Error ? error.message : 'Не удалось загрузить изображения');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    // product-block.tsx
    <div
      className="flex flex-col bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group"
      onMouseDown={handleMouseDown}
    >
      <div className="relative overflow-hidden rounded-lg mb-3">
        <ProductImageHoverArea images={displayedImages} />
        <input
          hidden={true}
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      <div className="flex flex-col space-y-2">
        <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {name}
        </span>

        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-green-600">{salePrice}₽</span>
          {quantity > 0 ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {quantity} шт
            </span>
          ) : (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
              Нет в наличии
            </span>
          )}
        </div>

        <span className="text-xs text-gray-500">Код: {idFromAnotherDb}</span>
      </div>
    </div>
  );
};

export default ProductBlock;
