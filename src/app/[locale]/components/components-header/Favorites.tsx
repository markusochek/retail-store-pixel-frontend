'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import heart from '@/../public/icons/heart.svg';
import heartFilled from '@/../public/icons/heart-filled.svg';

const Favorites = () => {
  const [isFavoritesSelected, setIsFavoritesSelected] = useState(false);

  useEffect(() => {
    let isFavoritesSelectedFromLocalStorage = localStorage.getItem('isFavoritesSelected');
    if (
      isFavoritesSelectedFromLocalStorage === null ||
      isFavoritesSelectedFromLocalStorage === undefined
    ) {
      isFavoritesSelectedFromLocalStorage = 'false';
    }
    setIsFavoritesSelected(isFavoritesSelectedFromLocalStorage === 'true');
  }, []);

  const OnMouseDown = () => {
    const newValue = !isFavoritesSelected;
    localStorage.setItem('isFavoritesSelected', newValue ? 'true' : 'false');
    setIsFavoritesSelected(newValue);
  };

  return (
    <div onMouseDown={OnMouseDown}>
      {isFavoritesSelected ? (
        <Image src={heartFilled} alt={'избранное выбрано'} className={'w-8 h-8'}></Image>
      ) : (
        <Image src={heart} alt={'избранное не выбрано'} className={'w-8 h-8'}></Image>
      )}
    </div>
  );
};

export default Favorites;
