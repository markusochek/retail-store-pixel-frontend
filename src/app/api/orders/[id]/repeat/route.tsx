import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Получаем заказ
    const order = await prisma.orders.findUnique({
      where: {
        id: parseInt(id),
        user_id: user.id, // Гарантируем, что пользователь повторяет только свои заказы
      },
      include: {
        order_items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    // Добавляем товары из заказа в корзину
    for (const item of order.order_items) {
      // Проверяем, есть ли уже товар в корзине
      const existingCartItem = await prisma.cart_items.findUnique({
        where: {
          user_id_product_id: {
            user_id: user.id,
            product_id: item.product_id,
          },
        },
      });

      if (existingCartItem) {
        // Обновляем количество
        await prisma.cart_items.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity + item.quantity,
          },
        });
      } else {
        // Добавляем новый товар
        await prisma.cart_items.create({
          data: {
            user_id: user.id,
            product_id: item.product_id,
            quantity: item.quantity,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Товары добавлены в корзину',
      addedItems: order.order_items.length,
    });
  } catch (error) {
    console.error('Repeat order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
