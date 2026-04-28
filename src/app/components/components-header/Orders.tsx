'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrdersStore } from '@/stores/useOrdersStore';
import { Package } from 'lucide-react';

interface OrdersProps {
  serverCount: number;
}

const Orders = ({ serverCount }: OrdersProps) => {
  const router = useRouter();

  const { count, setCount } = useOrdersStore();

  useEffect(() => {
    if (serverCount !== 0) {
      setCount(serverCount);
    } else {
      const ordersFromStorage = localStorage.getItem('orders');
      if (ordersFromStorage) {
        const orders = JSON.parse(ordersFromStorage);
        setCount(orders.length);
      }
    }
  }, [serverCount, setCount]);

  const handleClick = () => {
    router.push('/orders');
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      title="Избранное"
    >
      <Package className={'w-8 h-8'} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
};

export default Orders;
