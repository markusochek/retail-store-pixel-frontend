import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import BasketPageClient from './components/BasketPageClient';
import { prisma } from '@/lib/db/prisma';
import React from 'react';
import { CartItem } from '@/types/cartItem';

export default async function BasketPage() {
  const session = await getServerSession(authOptions);

  let totalAmount = 0;

  if (!session || !session.user || !session.user.email) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Корзина</h1>
        <BasketPageClient initialCartItems={[]} initialTotalAmount={0} isEntrance={!!session} />
      </div>
    );
  }

  const user = await prisma.users.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Корзина</h1>
        <BasketPageClient initialCartItems={[]} initialTotalAmount={0} isEntrance={true} />
      </div>
    );
  }

  const rawCartItems = await prisma.cart_items.findMany({
    where: { user_id: user.id },
    include: {
      products: {
        include: {
          images: true,
        },
      },
    },
  });
  const cartItems: CartItem[] = JSON.parse(JSON.stringify(rawCartItems));

  totalAmount = cartItems.reduce((sum, item) => {
    return sum + item.products.sale_price * item.quantity;
  }, 0);

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
