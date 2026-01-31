import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { notFound, redirect } from 'next/navigation';
import OrderDetailClient from './components/OrderDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const user = await prisma.users.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  const order = await prisma.orders.findUnique({
    where: {
      id: parseInt(id),
      user_id: user.id, // Гарантируем, что пользователь видит только свои заказы
    },
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
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderDetailClient order={order} />
    </div>
  );
}
