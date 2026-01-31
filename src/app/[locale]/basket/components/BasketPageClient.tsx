'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AddToCartButton from '@/app/[locale]/components/components-product-container/components-product-container-client/compoments-product-block/AddToCartButton';

export default function BasketPageClient({
  initialCartItems,
  initialTotalAmount,
  isEntrance,
}: {
  initialCartItems: any[];
  initialTotalAmount: number;
  isEntrance: boolean;
}) {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<number | null>(null); // ID товара, который обновляется
  const router = useRouter();

  // Пересчитываем сумму при изменении cartItems
  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.products.sale_price.toString()) * item.quantity;
  }, 0);

  // Функция для обновления количества товара
  const updateAmount = useCallback(
    async (productId: number, newQuantity: number) => {
      setIsUpdating(productId);
      setIsLoading(true);

      try {
        if (newQuantity <= 0) {
          // Удаляем товар
          if (isEntrance) {
            const response = await fetch(`/api/cart/${productId}`, {
              method: 'DELETE',
            });

            if (response.ok) {
              setCartItems(prev => prev.filter(item => item.product_id !== productId));
            }
          } else {
            // Для неавторизованных - localStorage
            const cartFromStorage = localStorage.getItem('cart');
            if (cartFromStorage) {
              let cart = JSON.parse(cartFromStorage);
              cart = cart.filter((item: any) => item.productId !== productId);
              localStorage.setItem('cart', JSON.stringify(cart));
              setCartItems(prev => prev.filter(item => item.product_id !== productId));
            }
          }
        } else {
          // Обновляем количество
          if (isEntrance) {
            const response = await fetch(`/api/cart/${productId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quantity: newQuantity }),
            });

            if (response.ok) {
              setCartItems(prev =>
                prev.map(item =>
                  item.product_id === productId ? { ...item, quantity: newQuantity } : item
                )
              );
            }
          } else {
            // Для неавторизованных - localStorage
            const cartFromStorage = localStorage.getItem('cart');
            if (cartFromStorage) {
              let cart = JSON.parse(cartFromStorage);
              cart = cart.map((item: any) =>
                item.productId === productId ? { ...item, quantity: newQuantity } : item
              );
              localStorage.setItem('cart', JSON.stringify(cart));
              setCartItems(prev =>
                prev.map(item =>
                  item.product_id === productId ? { ...item, quantity: newQuantity } : item
                )
              );
            }
          }
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      } finally {
        setIsLoading(false);
        setIsUpdating(null);
      }
    },
    [isEntrance]
  );

  // Синхронизируем localStorage для неавторизованных пользователей
  useEffect(() => {
    if (!isEntrance) {
      const cartFromStorage = localStorage.getItem('cart');
      if (cartFromStorage) {
        const cart = JSON.parse(cartFromStorage);
        // Можно обновить cartItems из localStorage при загрузке
      }
    }
  }, [isEntrance]);

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleProductClick = (id: number, e: React.MouseEvent) => {
    if (e.button === 0) {
      e.preventDefault();
      router.push(`/products/${id}`);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Корзина пуста</h2>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Вернуться к покупкам
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Товары в корзине</h2>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center flex-grow">
                  <div
                    className="w-24 h-24 relative flex-shrink-0 cursor-pointer"
                    onMouseDown={e => handleProductClick(item.products.id, e)}
                  >
                    <Image
                      src={`/uploads/images/${item.products.images[0]?.path_to_image || 'default.jpg'}`}
                      alt={item.products.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="ml-4">
                    <div
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer"
                      onMouseDown={e => handleProductClick(item.products.id, e)}
                    >
                      {item.products.name}
                    </div>
                    <p className="text-gray-600 mt-1">
                      {parseFloat(item.products.sale_price.toString())} ₽
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      В наличии: {item.products.quantity} шт.
                    </p>
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0">
                  <AddToCartButton
                    productId={item.products.id}
                    isEntrance={isEntrance}
                    maxQuantity={item.products.quantity}
                    updateAmount={updateAmount}
                    className={`${isUpdating === item.products.id ? 'opacity-70' : ''}`}
                  />
                  <div className="text-center mt-2">
                    <span className="text-lg font-semibold">
                      {parseFloat(item.products.sale_price.toString()) * item.quantity} ₽
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Итого</h2>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>Товары ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} шт.)</span>
              <span>{totalAmount.toFixed(2)} ₽</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>К оплате</span>
                <span>{totalAmount.toFixed(2)} ₽</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isLoading || !isEntrance}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEntrance ? 'Перейти к оформлению' : 'Войдите для оформления'}
          </button>

          {!isEntrance && (
            <p className="text-sm text-red-600 mt-2 text-center">
              Для оформления заказа необходимо войти в систему
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
