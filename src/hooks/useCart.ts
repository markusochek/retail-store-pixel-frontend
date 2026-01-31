'use client';

import { useCallback } from 'react';
import { useBasketStore } from '@/stores/useBasketStore';

export const useCart = (productId: number, isEntrance: boolean) => {
  const { increment, decrement, count } = useBasketStore();

  const addToCart = useCallback(
    async (quantity: number = 1) => {
      try {
        if (isEntrance) {
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity }),
          });

          if (!response.ok) {
            throw new Error('Failed to add to cart');
          }

          increment();
        } else {
          // Для неавторизованных пользователей - localStorage
          const cartFromStorage = localStorage.getItem('cart');
          const cart: { productId: number; quantity: number }[] = cartFromStorage
            ? JSON.parse(cartFromStorage)
            : [];

          const existingItem = cart.find(item => item.productId === productId);
          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            cart.push({ productId, quantity });
          }

          localStorage.setItem('cart', JSON.stringify(cart));

          // Обновляем счетчик в сторе
          const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
          useBasketStore.getState().setCount(totalItems);
        }

        return true;
      } catch (error) {
        console.error('Error adding to cart:', error);
        return false;
      }
    },
    [productId, isEntrance, increment]
  );

  const removeFromCart = useCallback(async () => {
    try {
      if (isEntrance) {
        const response = await fetch(`/api/cart/${productId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove from cart');
        }

        decrement();
      } else {
        const cartFromStorage = localStorage.getItem('cart');
        if (cartFromStorage) {
          let cart = JSON.parse(cartFromStorage);
          const itemToRemove = cart.find((item: any) => item.productId === productId);
          cart = cart.filter((item: any) => item.productId !== productId);
          localStorage.setItem('cart', JSON.stringify(cart));

          // Обновляем счетчик
          if (itemToRemove) {
            const newTotal = count - itemToRemove.quantity;
            useBasketStore.getState().setCount(Math.max(0, newTotal));
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }, [productId, isEntrance, decrement, count]);

  const updateCartQuantity = useCallback(
    async (quantity: number) => {
      try {
        if (isEntrance) {
          const response = await fetch(`/api/cart/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }),
          });

          if (!response.ok) {
            throw new Error('Failed to update cart');
          }
        } else {
          const cartFromStorage = localStorage.getItem('cart');
          if (cartFromStorage) {
            let cart = JSON.parse(cartFromStorage);
            cart = cart.map((item: any) =>
              item.productId === productId ? { ...item, quantity } : item
            );
            localStorage.setItem('cart', JSON.stringify(cart));

            // Пересчитываем общее количество
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            useBasketStore.getState().setCount(totalItems);
          }
        }

        return true;
      } catch (error) {
        console.error('Error updating cart quantity:', error);
        return false;
      }
    },
    [productId, isEntrance]
  );

  return { addToCart, removeFromCart, updateCartQuantity };
};
