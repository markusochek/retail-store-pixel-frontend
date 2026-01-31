import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { randomInt } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { customerName, customerPhone, customerEmail, notes } = await request.json();

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Получаем товары из корзины
    const cartItems = await prisma.cart_items.findMany({
      where: { user_id: user.id },
      include: {
        products: true,
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Корзина пуста' }, { status: 400 });
    }

    // Проверяем доступность товаров
    for (const item of cartItems) {
      if (item.products.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Товар "${item.products.name}" недоступен в нужном количестве` },
          { status: 400 }
        );
      }
    }

    // Рассчитываем общую сумму
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + item.products.sale_price.toNumber() * item.quantity;
    }, 0);

    // Генерируем номер заказа
    const orderNumber = `ORD-${Date.now()}-${randomInt(1000, 9999)}`;
    // Генерируем код для получения
    const pickupCode = randomInt(100000, 999999).toString();

    // Создаем заказ
    const order = await prisma.orders.create({
      data: {
        user_id: user.id,
        order_number: orderNumber,
        total_amount: totalAmount,
        customer_name: customerName || session.user.name || null,
        customer_phone: customerPhone || null,
        customer_email: customerEmail || session.user.email,
        pickup_code: pickupCode,
        notes: notes || null,
        order_status_id: 1,
      },
    });

    // Создаем элементы заказа и уменьшаем количество товаров
    for (const item of cartItems) {
      await prisma.order_items.create({
        data: {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.products.sale_price,
        },
      });

      // Уменьшаем количество товара на складе
      await prisma.products.update({
        where: { id: item.product_id },
        data: {
          quantity: item.products.quantity - item.quantity,
        },
      });
    }

    // Очищаем корзину
    await prisma.cart_items.deleteMany({
      where: { user_id: user.id },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - получение заказов пользователя
export async function GET() {
  try {
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

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
