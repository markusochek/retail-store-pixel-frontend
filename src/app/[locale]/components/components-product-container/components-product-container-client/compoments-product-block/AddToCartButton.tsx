'use client';

import React from 'react';
import { useCartQuantity } from '@/hooks/useCartQuantity';

const AddToCartButton = ({
  productId,
  isEntrance,
  maxQuantity,
  className = '',
  updateAmount,
}: {
  productId: number;
  isEntrance: boolean;
  maxQuantity: number;
  className?: string;
  updateAmount?: (productId: number, newQuantity: number) => Promise<void>;
}) => {
  const {
    quantity,
    isInCart,
    increment,
    decrement,
    addToCartWithQuantity,
    updateCartQuantity,
    removeFromCartCompletely,
  } = useCartQuantity(productId, isEntrance, maxQuantity);

  if (maxQuantity === 0) {
    return (
      <button
        disabled
        className={`w-full bg-gray-300 text-gray-600 py-2 px-4 rounded-lg font-medium cursor-not-allowed ${className}`}
      >
        Нет в наличии
      </button>
    );
  }

  if (isInCart) {
    return (
      <div
        className={`flex items-center justify-between border border-gray-300 rounded-lg overflow-hidden ${className}`}
      >
        <button
          onClick={async () => {
            // Немедленно обновляем UI
            const newQuantity = Math.max(quantity - 1, 0);

            if (newQuantity < 1) {
              // Если станет 0 или меньше - удаляем
              await removeFromCartCompletely();
              if (updateAmount) {
                await updateAmount(productId, 0);
              }
            } else {
              // Уменьшаем количество
              decrement();
              await updateCartQuantity(newQuantity);
              if (updateAmount) {
                await updateAmount(productId, newQuantity);
              }
            }
          }}
          className="w-10 h-10 flex items-center rounded-lg justify-center bg-gray-100 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Уменьшить количество"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <div className="flex-1 text-center px-2">
          <span className="font-medium">{quantity}</span>
        </div>

        <button
          onClick={async () => {
            // Немедленно обновляем UI
            const newQuantity = Math.min(quantity + 1, maxQuantity);

            if (quantity >= maxQuantity) return;

            increment();
            await updateCartQuantity(newQuantity);
            if (updateAmount) {
              await updateAmount(productId, newQuantity);
            }
          }}
          disabled={quantity >= maxQuantity}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Увеличить количество"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={async () => {
        const success = await addToCartWithQuantity();
        if (success && updateAmount) {
          await updateAmount(productId, 1);
        }
      }}
      disabled={maxQuantity === 0}
      className={`w-full bg-red-700 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      <span className="flex items-center justify-center cursor-pointer">В корзину</span>
    </button>
  );
};

export default AddToCartButton;
