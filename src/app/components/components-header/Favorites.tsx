'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import heart from '../../../../public/icons/heart.svg';
import { useRouter } from 'next/navigation';
import { useFavoritesStore } from '@/stores/useFavoritesStore';

interface FavoritesProps {
  serverCount: number;
}

const Favorites = ({ serverCount }: FavoritesProps) => {
  const router = useRouter();

  const { count, setCount } = useFavoritesStore();

  useEffect(() => {
    if (serverCount !== 0) {
      setCount(serverCount);
    } else {
      const favoritesFromStorage = localStorage.getItem('favorites');
      if (favoritesFromStorage) {
        const favorites = JSON.parse(favoritesFromStorage);
        setCount(favorites.length);
      }
    }
  }, [count, serverCount, setCount]);

  const handleClick = () => {
    router.push('/favorites');
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      title="Избранное"
    >
      <Image src={heart} alt={'Избранное'} className={'w-6 h-6'} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
};

export default Favorites;
