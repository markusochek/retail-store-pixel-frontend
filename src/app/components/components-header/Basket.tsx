'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import basket from '../../../../public/icons/basket.svg';
import { useBasketStore } from '@/stores/useBasketStore';

interface BasketProps {
  serverCount: number;
}

const Basket = ({ serverCount }: BasketProps) => {
  const router = useRouter();
  const { count, setCount } = useBasketStore();

  useEffect(() => {
    if (serverCount !== 0) {
      setCount(serverCount);
    } else {
      // Проверяем localStorage для неавторизованных пользователей
      const cartFromStorage = localStorage.getItem('cart');
      if (cartFromStorage) {
        const cart = JSON.parse(cartFromStorage);
        const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCount(totalItems);
      } else {
        setCount(0);
      }
    }
  }, [serverCount, setCount]);

  const handleClick = () => {
    router.push('/basket');
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      title="Корзина"
    >
      <Image src={basket} alt={'Товары'} className={'w-6 h-6'} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
};

export default Basket;
