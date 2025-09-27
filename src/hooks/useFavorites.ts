'use client';

import { useCallback, useEffect, useState } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const saved = window.localStorage.getItem('favorites');
        if (saved) {
          const parsed = JSON.parse(saved);
          setFavorites(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
        setFavorites([]);
      }
    };

    loadFavorites();
  }, []);

  const toggleFavorite = useCallback((productId: number) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];

      try {
        window.localStorage.setItem('favorites', JSON.stringify(newFavorites));
      } catch (error) {
        console.error('Failed to save favorites:', error);
      }

      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback(
    (productId: number) => {
      return favorites.includes(productId);
    },
    [favorites]
  );

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
}
