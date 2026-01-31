'use client';

import React, { useState } from 'react';

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

const statusOptions = [
  { value: 'pending', label: 'Ожидает подтверждения' },
  { value: 'confirmed', label: 'Подтвержден' },
  { value: 'assembling', label: 'Собирается' },
  { value: 'ready', label: 'Готов к выдаче' },
  { value: 'completed', label: 'Выдан' },
  { value: 'cancelled', label: 'Отменен' },
];

interface AdminOrdersClientProps {
  initialOrders: any[];
}

export default function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setIsLoading(prev => ({ ...prev, [orderId]: true }));

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map(order => (order.id === orderId ? updatedOrder : order)));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Ошибка при обновлении статуса заказа');
    } finally {
      setIsLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'менее часа назад';
    if (diffInHours < 24) return `${diffInHours} ч. назад`;
    return `${Math.floor(diffInHours / 24)} д. назад`;
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управление заказами</h1>
        <div className="text-sm text-gray-600">Всего заказов: {orders.length}</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Номер заказа
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Клиент
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <React.Fragment key={order.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                      <div className="text-sm text-gray-500">
                        Код получения: {order.pickup_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer_name || 'Не указано'}
                      </div>
                      <div className="text-sm text-gray-500">{order.customer_phone}</div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                      <div className="text-sm text-gray-500">{getTimeAgo(order.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.total_amount} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value)}
                          disabled={isLoading[order.id]}
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => toggleOrderDetails(order.id)}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1"
                        >
                          {expandedOrder === order.id ? 'Скрыть' : 'Подробнее'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedOrder === order.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Товары в заказе:</h4>
                            <div className="space-y-2">
                              {order.order_items.map(item => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between border-b pb-2"
                                >
                                  <div className="flex items-center">
                                    <div className="ml-3">
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.products.name}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Количество: {item.quantity} шт.
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.price * item.quantity} ₽
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {order.notes && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Комментарий к заказу:
                              </h4>
                              <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg">
                                {order.notes}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Временные метки:</h4>
                              <div className="space-y-1 text-sm">
                                <p>Создан: {formatDate(order.created_at)}</p>
                                {order.assembled_at && (
                                  <p>Начат сбор: {formatDate(order.assembled_at)}</p>
                                )}
                                {order.ready_at && <p>Готов: {formatDate(order.ready_at)}</p>}
                                {order.completed_at && (
                                  <p>Выдан: {formatDate(order.completed_at)}</p>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Контакты:</h4>
                              <div className="space-y-1 text-sm">
                                <p>Email: {order.users.email}</p>
                                {order.customer_phone && <p>Телефон: {order.customer_phone}</p>}
                                {order.customer_email && (
                                  <p>Email для связи: {order.customer_email}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Заказов пока нет</p>
          </div>
        )}
      </div>
    </div>
  );
}
