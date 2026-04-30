import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/db/prisma';
import AdminOrdersClient from './components/AdminOrdersClient';

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Доступ запрещен</h1>
      </div>
    );
  }

  const orders = await prisma.orders.findMany({
    include: {
      users: {
        select: {
          id: true,
          email: true,
        },
      },
      order_items: {
        include: {
          products: {
            include: {
              images: true,
            },
          },
        },
      },
      order_statuses: true,
    },
    orderBy: { created_at: 'desc' },
  });

  return <AdminOrdersClient initialOrders={JSON.parse(JSON.stringify(orders))} />;
}
