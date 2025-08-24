'use client';

import React, { useRef, useState } from 'react';
import Image, { StaticImageData } from 'next/image';

const ProductBlock = ({
  id,
  idFromAnotherDb,
  name,
  salePrice,
  pathToImage,
  isAdmin,
}: {
  id: bigint;
  idFromAnotherDb: bigint;
  name: string;
  salePrice: number;
  pathToImage: StaticImageData | string;
  isAdmin: boolean;
}) => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDivClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', id.toString());

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки файла');
      }

      const data = await response.json();
      setUploadedImageUrl(data.url);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось загрузить изображение');
    }
  };

  return (
    <div className={'flex flex-col whitespace-pre-line w-[18%]'}>
      <div
        className={
          'flex justify-center items-center border-2 border-dashed border-black cursor-pointer relative aspect-[3/4] overflow-hidden rounded-4xl bg-gray-100'
        }
        onClick={isAdmin ? handleDivClick : undefined}
      >
        <Image
          className="object-cover"
          src={uploadedImageUrl || pathToImage}
          alt={'error loaded'}
          fill
        />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
      </div>
      <span>Код: {idFromAnotherDb}</span>
      <span className={'line-clamp-2 overflow-hidden text-ellipsis'}>{name}</span>
      <span>Розничная цена</span>
      <span>{salePrice}₽</span>
    </div>
  );
};

export default ProductBlock;
