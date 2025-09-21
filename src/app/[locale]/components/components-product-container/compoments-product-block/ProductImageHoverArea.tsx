'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import thereIsNoPicture from '@/../public/icons/there-is-no-picture.png';

const ProductImageHoverArea = ({
  images,
}: {
  images: { id: number; path_to_image: string; product_id: number }[];
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[3/4] rounded-lg flex items-center justify-center">
        <Image src={thereIsNoPicture} alt={'Нет изображения'}></Image>
      </div>
    );
  }

  // Делим область на N частей (по количеству изображений)
  const areas = images.map((_, index) => {
    const width = 100 / images.length;
    return {
      left: `${index * width}%`,
      width: `${width}%`,
      index: index,
    };
  });

  return (
    <div className="relative w-full">
      <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src={'/uploads/images/' + images[currentImageIndex].path_to_image}
            alt={`Product image ${currentImageIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            priority={currentImageIndex <= 10}
          />
        </div>

        {/* Невидимые области для наведения */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex">
            {areas.map((area, index) => (
              <div
                key={index}
                className="h-full cursor-pointer"
                style={{
                  width: area.width,
                  left: area.left,
                  position: 'absolute',
                }}
                onMouseEnter={() => setCurrentImageIndex(index)}
                onMouseLeave={() => setCurrentImageIndex(0)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Кнопки ВНЕ контейнера с изображением */}
      {images.length > 1 && (
        <div className="flex justify-center gap-0.5 mt-1">
          {images.map((_, index) => (
            <button key={index} className={`relative transition-all duration-300 w-1`}>
              <div
                className={`h-1 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageHoverArea;
