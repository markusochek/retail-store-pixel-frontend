// hooks/useFavorites.ts
'use client';

import { useCallback, useState } from 'react';
import { useFavoritesStore } from '@/stores/useFavoritesStore';

export const useFavorites = (
  productId: number,
  isEntrance: boolean,
  initialIsFavorite: boolean
) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const { increment, decrement } = useFavoritesStore();

  const toggleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        if (isEntrance) {
          // Логика для авторизованных пользователей
          const response = await fetch(
            isFavorite ? `/api/favorites/${productId}` : '/api/favorites',
            {
              method: isFavorite ? 'DELETE' : 'POST',
              headers: isFavorite ? {} : { 'Content-Type': 'application/json' },
              body: isFavorite ? undefined : JSON.stringify({ productId }),
            }
          );

          if (!response.ok)
            throw new Error(`Failed to ${isFavorite ? 'remove from' : 'add to'} favorites`);

          if (isFavorite) {
            decrement();
          } else {
            increment();
          }
        } else {
          // Логика для неавторизованных пользователей
          const favoritesFromStorage = localStorage.getItem('favorites');
          let favorites: number[] = favoritesFromStorage ? JSON.parse(favoritesFromStorage) : [];

          if (isFavorite) {
            favorites = favorites.filter(fav => fav !== productId);
            decrement();
          } else {
            favorites.push(productId);
            increment();
          }

          localStorage.setItem('favorites', JSON.stringify(favorites));
        }

        setIsFavorite(!isFavorite);
      } catch (error) {
        console.error('Error updating favorites:', error);
      }
    },
    [productId, isEntrance, isFavorite, increment, decrement]
  );

  return { isFavorite, toggleFavorite };
};
