'use client';

import React, { useRef, useState } from 'react';
import ProductImageSliderEmbla from '@/app/components/ProductImageSliderEmbla';

const ProductBlock = ({
  id,
  idFromAnotherDb,
  name,
  salePrice,
  isAdmin,
  images,
}: {
  id: bigint;
  idFromAnotherDb: bigint;
  name: string;
  salePrice: number;
  isAdmin: boolean;
  images: { id: bigint; path_to_image: string; product_id: bigint }[];
}) => {
  const [displayedImages, setDisplayedImages] = useState(images);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.ctrlKey) {
      e.preventDefault();
      fileInputRef.current?.click();
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
    <div
      className={
        'flex flex-col whitespace-pre-line bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow'
      }
    >
      <div className={'cursor-pointer'} onMouseDown={isAdmin ? handleMouseDown : undefined}>
        <ProductImageSliderEmbla images={displayedImages} />
        <input
          hidden={true}
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
      <div className="flex flex-col justify-center align-center mt-3 space-y-1">
        <span className="text-lg font-bold">{salePrice}₽</span>
        <span className={'text-sm font-medium line-clamp-2'}>{name}</span>
        <span className="text-xs text-gray-500">Код: {idFromAnotherDb}</span>
      </div>
    </div>
  );
};

export default ProductBlock;
