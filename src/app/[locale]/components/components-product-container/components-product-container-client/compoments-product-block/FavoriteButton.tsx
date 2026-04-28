// components/product/FavoriteButton.tsx
'use client';

import React from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { Heart } from 'lucide-react';

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
      {isFavorite ? (
        <Heart className="w-7 h-7 text-red-500 fill-red-500" />
      ) : (
        <Heart className="w-7 h-7" />
      )}
    </button>
  );
};

export default FavoriteButton;
