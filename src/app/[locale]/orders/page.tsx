import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import OrdersClient from './components/OrdersClient';
import React from 'react';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          Для просмотра заказов необходимо войти в систему
        </div>
      </div>
    );
  }

  const user = await prisma.users.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          Пользователь не найден
        </div>
      </div>
    );
  }

  const orders = await prisma.orders.findMany({
    where: { user_id: user.id },
    include: {
      order_items: {
        include: {
          products: {
            include: {
              images: true,
            },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
      <OrdersClient initialOrders={orders} />
    </div>
  );
}
