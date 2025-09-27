'use client';

import React from 'react';
import Image from 'next/image';
import heart from '@/../public/icons/heart.svg';
import { useRouter } from 'next/navigation';

interface FavoritesProps {
  favoritesCount: number;
}

const Favorites = ({ favoritesCount }: FavoritesProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push('/favorites');
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      title="Избранное"
    >
      <Image src={heart} alt={'Избранное'} className={'w-6 h-6'} />
      {favoritesCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {favoritesCount}
        </span>
      )}
    </button>
  );
};

export default Favorites;
