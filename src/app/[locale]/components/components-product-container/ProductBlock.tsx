'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductImageHoverArea from '@/app/[locale]/components/components-product-container/compoments-product-block/ProductImageHoverArea';
import ProductInfo from '@/app/[locale]/components/components-product-container/compoments-product-block/ProductsInfo';

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
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!isAdmin) return;

      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    },
    [isAdmin]
  );

  const onDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!isAdmin) return;

      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    },
    [isAdmin]
  );

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      if (!isAdmin) return;

      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      await handleFilesUpload(files);
    },
    [isAdmin]
  );

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await handleFilesUpload(files);
  };

  const handleFilesUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      let hasValidFiles = false;

      for (let i = 0; i < files.length; i++) {
        if (!files[i].type.startsWith('image/')) {
          alert('Пожалуйста, выбирайте только файлы изображений!');
          continue;
        }
        formData.append('files', files[i]);
        hasValidFiles = true;
      }

      if (!hasValidFiles) return;

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

      alert(`Успешно загружено ${data.uploadedFiles.length} изображений`);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert(error instanceof Error ? error.message : 'Не удалось загрузить изображения');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (isAdmin && e.button === 0 && e.ctrlKey) {
      e.preventDefault();
      fileInputRef.current?.click();
      return;
    }

    if (e.button === 0) {
      e.preventDefault();
      router.push(`/products/${idFromAnotherDb}`);
    }
  };

  return (
    <div
      className={`flex flex-col bg-white rounded-xl p-4 shadow-sm border-2 border-gray-100 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group relative ${
        isDragOver ? 'border-blue-400 bg-blue-50 scale-105 shadow-lg' : ''
      } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onMouseDown={onMouseDown}
    >
      {isUploading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-xl z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {isAdmin && isDragOver && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-50 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center z-20">
          <div className="text-center">
            <svg
              className="w-12 h-12 text-blue-500 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-blue-600 font-medium">Отпустите чтобы загрузить</p>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-lg mb-3">
        <ProductImageHoverArea images={displayedImages} />

        <input
          hidden={true}
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={onFileChange}
        />
      </div>

      <ProductInfo
        name={name}
        quantity={quantity}
        salePrice={salePrice}
        idFromAnotherDb={idFromAnotherDb}
      ></ProductInfo>
    </div>
  );
};

export default ProductBlock;
