import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import BasketPageClient from './components/BasketPageClient';
import { prisma } from '@/lib/db/prisma';
import React from 'react';

export default async function BasketPage() {
  const session = await getServerSession(authOptions);

  let cartItems = [];
  let totalAmount = 0;

  if (session?.user?.email) {
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (user) {
      cartItems = await prisma.cart_items.findMany({
        where: { user_id: user.id },
        include: {
          products: {
            include: {
              images: true,
            },
          },
        },
      });

      totalAmount = cartItems.reduce((sum, item) => {
        return sum + item.products.sale_price.toNumber() * item.quantity;
      }, 0);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Корзина</h1>
      <BasketPageClient
        initialCartItems={cartItems}
        initialTotalAmount={totalAmount}
        isEntrance={!!session}
      />
    </div>
  );
}
