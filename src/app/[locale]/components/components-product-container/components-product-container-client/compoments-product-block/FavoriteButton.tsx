// components/product/FavoriteButton.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import heart from '../../../../../../../public/icons/heart.svg';
import heartFilled from '../../../../../../../public/icons/heart-filled.svg';
import { useFavorites } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  productId: number;
  isEntrance: boolean;
  isFavoriteInitialization: boolean;
}

const FavoriteButton = ({
  productId,
  isEntrance,
  isFavoriteInitialization,
}: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useFavorites(
    productId,
    isEntrance,
    isFavoriteInitialization
  );

  return (
    <button
      className="absolute top-3 right-3 z-10 p-1 bg-white rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
      onClick={toggleFavorite}
      title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <Image
        src={isFavorite ? heartFilled : heart}
        alt={isFavorite ? 'В избранном' : 'Добавить в избранное'}
        className="w-6 h-6"
      />
    </button>
  );
};

export default FavoriteButton;
