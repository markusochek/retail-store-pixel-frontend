'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  assembling: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтвержден',
  assembling: 'Собирается',
  ready: 'Готов к выдаче',
  completed: 'Выдан',
  cancelled: 'Отменен',
};

interface OrderDetailClientProps {
  order: any;
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusTimeline = () => {
    const timeline = [
      {
        status: 'pending',
        label: 'Заказ создан',
        date: order.created_at,
        completed: true,
      },
      {
        status: 'confirmed',
        label: 'Заказ подтвержден',
        date: order.status !== 'pending' ? order.updated_at : null,
        completed: ['confirmed', 'assembling', 'ready', 'completed'].includes(order.status),
      },
      {
        status: 'assembling',
        label: 'Заказ собирается',
        date: order.assembled_at,
        completed: ['assembling', 'ready', 'completed'].includes(order.status),
      },
      {
        status: 'ready',
        label: 'Заказ готов',
        date: order.ready_at,
        completed: ['ready', 'completed'].includes(order.status),
      },
      {
        status: 'completed',
        label: 'Заказ получен',
        date: order.completed_at,
        completed: order.status === 'completed',
      },
    ];

    return timeline;
  };

  const handleRepeatOrder = async () => {
    if (confirm('Добавить все товары из этого заказа в корзину?')) {
      try {
        const response = await fetch(`/api/orders/${order.id}/repeat`, {
          method: 'POST',
        });

        if (response.ok) {
          alert('Товары добавлены в корзину!');
          router.push('/basket');
          router.refresh();
        } else {
          throw new Error('Не удалось повторить заказ');
        }
      } catch (error) {
        console.error('Error repeating order:', error);
        alert('Произошла ошибка при добавлении товаров в корзину');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Заказ №{order.order_number}</h1>
          <p className="text-gray-500 mt-2">от {formatDate(order.created_at)}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/orders')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Назад к заказам
          </button>
          {order.status !== 'cancelled' && order.status !== 'completed' && (
            <button
              onClick={() => {
                if (confirm('Вы уверены, что хотите отменить заказ?')) {
                  // Здесь будет вызов API для отмены заказа
                  alert('Функция отмены заказа в разработке');
                }
              }}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
            >
              Отменить заказ
            </button>
          )}
          <button
            onClick={handleRepeatOrder}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Повторить заказ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Статус заказа</h2>
              <span
                className={`px-4 py-2 text-sm font-semibold rounded-full ${statusColors[order.status]}`}
              >
                {statusLabels[order.status]}
              </span>
            </div>

            <div className="space-y-4">
              {getStatusTimeline().map((step, index) => (
                <div key={step.status} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    {step.completed ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">{step.label}</div>
                    {step.date && (
                      <div className="text-sm text-gray-500">{formatDate(step.date)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {order.status === 'ready' && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium text-green-800">
                    Заказ готов к выдаче! Приходите в магазин по адресу: ул. Примерная, д. 10
                  </span>
                </div>
                <div className="mt-2 text-green-700">
                  Не забудьте код получения: <span className="font-bold">{order.pickup_code}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Состав заказа</h2>
            <div className="space-y-4">
              {order.order_items.map(item => (
                <div key={item.id} className="flex items-center justify-between py-4 border-b">
                  <div className="flex items-center">
                    <div className="w-16 h-16 relative flex-shrink-0">
                      <Image
                        src={`/uploads/images/${item.products.images[0]?.path_to_image || 'default.jpg'}`}
                        alt={item.products.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">{item.products.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.quantity} шт. × {item.price} ₽
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{item.price * item.quantity} ₽</p>
                    <button
                      onClick={() => router.push(`/products/${item.products.id}`)}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      Посмотреть товар
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="space-y-2">
                <div className="flex justify-between text-lg">
                  <span>Итого:</span>
                  <span className="font-bold">{order.total_amount} ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Информация о заказе</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Контактные данные</h3>
                <div className="space-y-1 text-sm">
                  <p>Имя: {order.customer_name || 'Не указано'}</p>
                  <p>Телефон: {order.customer_phone}</p>
                  <p>Код получения: {order.pickup_code}</p>
                </div>
              </div>

              {order.notes && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Ваш комментарий</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Детали заказа</h3>
                <div className="space-y-1 text-sm">
                  <p>Номер заказа: {order.order_number}</p>
                  <p>Дата создания: {formatDate(order.created_at)}</p>
                  <p>Товаров: {order.order_items.length} позиций</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Нужна помощь?</h3>
            <p className="text-sm text-blue-800 mb-4">
              Если у вас есть вопросы по заказу, свяжитесь с нами:
            </p>
            <div className="space-y-2 text-sm">
              <p className="font-medium">Телефон: +7 (999) 123-45-67</p>
              <p className="font-medium">Email: support@example.com</p>
              <p className="font-medium">Адрес магазина: ул. Примерная, д. 10</p>
              <p className="text-gray-600 mt-3">Часы работы: 9:00 - 21:00, ежедневно</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
