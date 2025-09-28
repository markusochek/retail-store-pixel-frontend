'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductImageHoverArea from '@/app/[locale]/components/components-product-container/compoments-product-block/ProductImageHoverArea';
import ProductInfo from '@/app/[locale]/components/components-product-container/compoments-product-block/ProductsInfo';
import FileUploadInput from '@/app/[locale]/components/components-product-container/compoments-product-block/FileUploadInput';
import uploadImages from '@/../public/icons/upload-icon.svg';
import heart from '@/../public/icons/heart.svg';
import heartFilled from '@/../public/icons/heart-filled.svg';
import Image from 'next/image';
import { useFavoritesStore } from '@/stores/useFavoritesStore';

const ProductBlock = ({
  id,
  name,
  salePrice,
  quantity,
  images,
  isFavoriteInitialization,
  isEntrance,
  isAdmin,
}: {
  id: number;
  name: string;
  salePrice: number;
  quantity: number;
  images: { id: number; path_to_image: string; product_id: number }[];
  isFavoriteInitialization: boolean;
  isEntrance: boolean;
  isAdmin: boolean;
}) => {
  const { increment, decrement } = useFavoritesStore();

  const [displayedImages, setDisplayedImages] = useState(images);
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitialization);
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
        uploadedFiles: { id: number; path_to_image: string; product_id: number }[];
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
    if (e.button === 0) {
      e.preventDefault();
      router.push(`/products/${id}`);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const productId = id;

      if (isEntrance && isFavorite) {
        const response = await fetch(`/api/favorites/${productId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove from favorites');
        } else {
          decrement();
        }
      }

      if (isEntrance && !isFavorite) {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          throw new Error('Failed to add to favorites');
        } else {
          increment();
        }
      }

      if (!isEntrance && isFavorite) {
        const favoritesFromStorage = localStorage.getItem('favorites');
        if (favoritesFromStorage) {
          let favorites: number[] = JSON.parse(favoritesFromStorage);
          favorites = favorites.filter(favorite => favorite !== productId);
          localStorage.setItem('favorites', JSON.stringify(favorites));
        }
        decrement();
      }

      if (!isEntrance && !isFavorite) {
        const favoritesFromStorage = localStorage.getItem('favorites');
        if (favoritesFromStorage) {
          const favorites = JSON.parse(favoritesFromStorage);
          favorites.push(productId);
          localStorage.setItem('favorites', JSON.stringify(favorites));
        }
        increment();
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  return (
    <div
      className={`flex flex-col bg-white rounded-xl p-4 shadow-sm border-2 border-gray-100 hover:shadow-md hover:border-blue-100 transition-all group relative ${
        isDragOver ? 'border-blue-400 bg-blue-50 scale-105 shadow-lg' : ''
      } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <button
        className="absolute top-3 right-3 z-10 p-1 bg-white rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
        onClick={handleFavoriteClick}
        title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
      >
        <Image
          src={isFavorite ? heartFilled : heart}
          alt={isFavorite ? 'В избранном' : 'Добавить в избранное'}
          className="w-6 h-6"
        />
      </button>

      {isUploading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-xl z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {isAdmin && isDragOver && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-50 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center z-20">
          <div className="text-center">
            <Image src={uploadImages} alt={''} className="w-12 h-12 mx-auto mb-2" />
            <p className="text-blue-600 font-medium">Отпустите чтобы загрузить</p>
          </div>
        </div>
      )}

      <div onMouseDown={onMouseDown} className="relative overflow-hidden rounded-lg mb-3">
        <ProductImageHoverArea images={displayedImages} />
        <FileUploadInput fileInputRef={fileInputRef}></FileUploadInput>
      </div>

      <ProductInfo
        onMouseDown={onMouseDown}
        name={name}
        quantity={quantity}
        salePrice={salePrice}
        id={id}
      ></ProductInfo>
    </div>
  );
};

export default ProductBlock;
