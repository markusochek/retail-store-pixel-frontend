'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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

interface OrdersClientProps {
  initialOrders: any[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders] = useState<any[]>(initialOrders);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
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

  const getOrderStatusDescription = (status: string) => {
    const descriptions: Record<string, string> = {
      pending: 'Заказ ожидает подтверждения оператором. Обычно это занимает до 30 минут.',
      confirmed: 'Заказ подтвержден и будет собран в ближайшее время.',
      assembling: 'Заказ собирается в магазине. Вы получите уведомление, когда он будет готов.',
      ready: 'Заказ готов к выдаче! Приходите в магазин с кодом получения.',
      completed: 'Заказ был выдан и оплачен.',
      cancelled: 'Заказ был отменен.',
    };
    return descriptions[status] || 'Статус неизвестен';
  };

  const getOrderInstructions = (order: any) => {
    if (order.status === 'ready') {
      return `Приходите в магазин по адресу: ул. Примерная, д. 10. Код получения: ${order.pickup_code}`;
    }
    return '';
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleRepeatOrder = async (orderId: number) => {
    if (confirm('Добавить все товары из этого заказа в корзину?')) {
      try {
        // Получаем детали заказа
        const response = await fetch(`/api/orders/${orderId}/repeat`, {
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
    <div className="space-y-6">
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">У вас пока нет заказов</h2>
          <p className="text-gray-500 mb-6">Сделайте свой первый заказ!</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Перейти к покупкам
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Статистика</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{orders.length}</div>
                <div className="text-sm text-blue-600">Всего заказов</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {orders.filter(o => o.status === 'completed').length}
                </div>
                <div className="text-sm text-green-600">Завершенных</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">
                  {
                    orders.filter(o =>
                      ['pending', 'confirmed', 'assembling', 'ready'].includes(o.status)
                    ).length
                  }
                </div>
                <div className="text-sm text-yellow-600">Активных</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">История заказов</h2>

            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Заказ №{order.order_number}
                        </h3>
                        <span
                          className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[order.status]}`}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {getOrderStatusDescription(order.status)}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{order.total_amount} ₽</div>
                      <p className="text-sm text-gray-500">{order.order_items.length} товар(ов)</p>
                    </div>
                  </div>

                  {getOrderInstructions(order) && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
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
                          {getOrderInstructions(order)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => toggleOrderDetails(order.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {expandedOrder === order.id ? 'Скрыть детали' : 'Показать детали'}
                    </button>

                    <div className="flex gap-3">
                      {order.status !== 'cancelled' && order.status !== 'completed' && (
                        <button
                          onClick={() => {
                            if (confirm('Вы уверены, что хотите отменить заказ?')) {
                              // Здесь будет вызов API для отмены заказа
                              alert('Функция отмены заказа в разработке');
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Отменить заказ
                        </button>
                      )}

                      <button
                        onClick={() => handleRepeatOrder(order.id)}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
                      >
                        Повторить заказ
                      </button>
                    </div>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t bg-gray-50 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Состав заказа:</h4>
                    <div className="space-y-3">
                      {order.order_items.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-3 border-b"
                        >
                          <div className="flex items-center">
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">{item.products.name}</p>
                              <p className="text-sm text-gray-500">
                                {item.quantity} шт. × {item.price} ₽
                              </p>
                            </div>
                          </div>
                          <p className="font-medium text-gray-900">
                            {item.price * item.quantity} ₽
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Итого:</span>
                        <span>{order.total_amount} ₽</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Ваш комментарий:</h4>
                        <p className="text-gray-600 bg-white p-3 rounded-lg border">
                          {order.notes}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Контактная информация:</p>
                        <p>Имя: {order.customer_name || 'Не указано'}</p>
                        <p>Телефон: {order.customer_phone}</p>
                        <p>Код получения: {order.pickup_code}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Даты:</p>
                        <p>Создан: {formatDate(order.created_at)}</p>
                        {order.ready_at && <p>Готов к выдаче: {formatDate(order.ready_at)}</p>}
                        {order.completed_at && <p>Получен: {formatDate(order.completed_at)}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
