'use client';

import { useCallback, useEffect, useState } from 'react';
import { useCart } from './useCart';

export const useCartQuantity = (productId: number, isEntrance: boolean, maxQuantity: number) => {
  const { addToCart, removeFromCart } = useCart(productId, isEntrance);
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemQuantity, setCartItemQuantity] = useState<number | null>(null);

  // Проверяем, есть ли товар уже в корзине при инициализации
  const checkIfInCart = useCallback(async () => {
    try {
      if (isEntrance) {
        // Для авторизованных пользователей проверяем через API
        const response = await fetch('/api/cart');
        if (response.ok) {
          const cartItems = await response.json();
          const existingItem = cartItems.find((item: any) => item.product_id === productId);
          if (existingItem) {
            setCartItemQuantity(existingItem.quantity);
            setQuantity(existingItem.quantity);
            setIsInCart(true);
            return existingItem.quantity;
          }
        }
      } else {
        // Для неавторизованных проверяем localStorage
        const cartFromStorage = localStorage.getItem('cart');
        if (cartFromStorage) {
          const cart = JSON.parse(cartFromStorage);
          const existingItem = cart.find((item: any) => item.productId === productId);
          if (existingItem) {
            setCartItemQuantity(existingItem.quantity);
            setQuantity(existingItem.quantity);
            setIsInCart(true);
            return existingItem.quantity;
          }
        }
      }
    } catch (error) {
      console.error('Error checking cart:', error);
    }
    return 0;
  }, [productId, isEntrance]);

  // Инициализируем при монтировании
  useEffect(() => {
    checkIfInCart();
  }, [checkIfInCart]);

  const increment = useCallback(() => {
    const newQuantity = Math.min((cartItemQuantity || 0) + 1, maxQuantity);
    setQuantity(newQuantity);
    setCartItemQuantity(newQuantity);
  }, [cartItemQuantity, maxQuantity]);

  const decrement = useCallback(() => {
    const newQuantity = Math.max((cartItemQuantity || 1) - 1, 1);
    setQuantity(newQuantity);
    setCartItemQuantity(newQuantity);
  }, [cartItemQuantity]);

  const addToCartWithQuantity = useCallback(async () => {
    try {
      const success = await addToCart(1); // Добавляем 1 штуку при первом нажатии
      if (success) {
        setIsInCart(true);
        setCartItemQuantity(1);
        setQuantity(1);
      }
      return success;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }, [addToCart]);

  const updateCartQuantity = useCallback(
    async (newQuantity: number) => {
      if (!isInCart) return false;

      try {
        if (isEntrance) {
          // Обновляем через API
          const response = await fetch(`/api/cart/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity }),
          });

          if (response.ok) {
            setCartItemQuantity(newQuantity);
            return true;
          }
        } else {
          // Обновляем в localStorage
          const cartFromStorage = localStorage.getItem('cart');
          if (cartFromStorage) {
            let cart = JSON.parse(cartFromStorage);
            cart = cart.map((item: any) =>
              item.productId === productId ? { ...item, quantity: newQuantity } : item
            );
            localStorage.setItem('cart', JSON.stringify(cart));
            setCartItemQuantity(newQuantity);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Error updating cart quantity:', error);
        return false;
      }
    },
    [productId, isEntrance, isInCart]
  );

  const removeFromCartCompletely = useCallback(async () => {
    try {
      const success = await removeFromCart();
      if (success) {
        setIsInCart(false);
        setCartItemQuantity(null);
        setQuantity(1);
      }
      return success;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }, [removeFromCart]);

  return {
    quantity,
    isInCart,
    increment,
    decrement,
    addToCartWithQuantity,
    updateCartQuantity,
    removeFromCartCompletely,
    setQuantity,
    checkIfInCart,
  };
};
