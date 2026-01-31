// components/product/ProductBlock.tsx
'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import FavoriteButton from '@/app/[locale]/components/components-product-container/components-product-container-client/compoments-product-block/FavoriteButton';
import DragOverlay from '@/app/[locale]/components/components-product-container/components-product-container-client/compoments-product-block/DragOverlay';
import ProductImageHoverArea from '@/app/[locale]/components/components-product-container/components-product-container-client/compoments-product-block/ProductImageHoverArea';
import FileUploadInput from '@/app/[locale]/components/components-product-container/components-product-container-client/compoments-product-block/FileUploadInput';
import ProductInfo from '@/app/[locale]/components/components-product-container/components-product-container-client/compoments-product-block/ProductsInfo';
import AddToCartButton from '@/app/[locale]/components/components-product-container/components-product-container-client/compoments-product-block/AddToCartButton';

interface ProductBlockProps {
  id: number;
  name: string;
  salePrice: number;
  quantity: number;
  images: { id: number; path_to_image: string; product_id: number }[];
  isFavoriteInitialization: boolean;
  isEntrance: boolean;
  isAdmin: boolean;
}

const ProductBlock = ({
  id,
  name,
  salePrice,
  quantity,
  images,
  isFavoriteInitialization,
  isEntrance,
  isAdmin,
}: ProductBlockProps) => {
  const [displayedImages, setDisplayedImages] = useState(images);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFilesUpload = async (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Пожалуйста, выбирайте только файлы изображений!');
      return;
    }

    const formData = new FormData();
    validFiles.forEach(file => formData.append('files', file));
    formData.append('productId', id.toString());

    const response = await fetch('/api/upload/images', { method: 'POST', body: formData });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Ошибка загрузки файлов');
    }

    const data = await response.json();
    setDisplayedImages(data.uploadedFiles);
  };

  const { isDragOver, isUploading, dragHandlers } = useDragAndDrop(isAdmin, handleFilesUpload);

  const handleProductClick = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.preventDefault();
      router.push(`/products/${id}`);
    }
  };

  return (
    <div
      className="flex flex-col bg-white rounded-xl p-4 shadow-sm border-2 border-gray-100 hover:shadow-md hover:border-blue-100 transition-all group relative"
      {...dragHandlers}
    >
      <FavoriteButton
        productId={id}
        isEntrance={isEntrance}
        isFavoriteInitialization={isFavoriteInitialization}
      />

      <DragOverlay isDragOver={isDragOver} isUploading={isUploading} {...dragHandlers} />

      <div
        onMouseDown={handleProductClick}
        className={`
          relative overflow-hidden rounded-lg mb-3
          ${isDragOver ? 'border-2 border-blue-400 bg-blue-50 scale-105' : ''}
          ${isUploading ? 'opacity-70' : ''}
        `}
      >
        <ProductImageHoverArea images={displayedImages} />
        <FileUploadInput fileInputRef={fileInputRef} />
      </div>

      <div className="flex flex-col flex-grow">
        <ProductInfo
          onMouseDown={handleProductClick}
          name={name}
          quantity={quantity}
          salePrice={salePrice}
          id={id}
        />

        <AddToCartButton
          productId={id}
          isEntrance={isEntrance}
          maxQuantity={quantity}
          className="mt-auto"
        />
      </div>
    </div>
  );
};

export default ProductBlock;
