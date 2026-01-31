import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';

// GET - получить корзину
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

    const cartItems = await prisma.cart_items.findMany({
      where: { user_id: user.id },
      include: {
        products: {
          include: {
            images: true,
          },
        },
      },
    });

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - добавить товар в корзину
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Проверяем существует ли товар
    const product = await prisma.products.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    // Проверяем есть ли уже товар в корзине
    const existingCartItem = await prisma.cart_items.findUnique({
      where: {
        user_id_product_id: {
          user_id: user.id,
          product_id: Number(productId),
        },
      },
    });

    let cartItem;
    if (existingCartItem) {
      // Обновляем количество
      cartItem = await prisma.cart_items.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      });
    } else {
      // Добавляем новый товар
      cartItem = await prisma.cart_items.create({
        data: {
          user_id: user.id,
          product_id: Number(productId),
          quantity,
        },
      });
    }

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
