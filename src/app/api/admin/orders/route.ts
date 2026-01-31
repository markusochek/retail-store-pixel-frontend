import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';

// GET - все заказы (для админа)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: { roles: true },
    });

    if (!user || user.roles.name !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const orders = await prisma.orders.findMany({
      include: {
        users: {
          select: {
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
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Admin Orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - обновление статуса заказа
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: { roles: true },
    });

    if (!user || user.roles.name !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    const updateData: any = {
      status,
      updated_at: new Date(),
    };

    // Устанавливаем временные метки в зависимости от статуса
    if (status === 'assembling') {
      updateData.assembled_at = new Date();
    } else if (status === 'ready') {
      updateData.ready_at = new Date();
    } else if (status === 'completed') {
      updateData.completed_at = new Date();
    }

    const order = await prisma.orders.update({
      where: { id: Number(orderId) },
      data: updateData,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Admin Orders PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
