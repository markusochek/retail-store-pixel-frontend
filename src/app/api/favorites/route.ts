import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import loggerServer from '@/lib/logger/logger-server';

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

    const favorites = await prisma.favorites.findMany({
      where: { user_id: user.id },
      include: {
        products: {
          include: {
            images: true,
          },
        },
      },
      // orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    loggerServer.error('Favorites GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const existingFavorite = await prisma.favorites.findUnique({
      where: {
        user_id_product_id: {
          user_id: user.id,
          product_id: Number(productId),
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json({ message: 'Товар уже в избранном' }, { status: 409 });
    }

    const favorite = await prisma.favorites.create({
      data: {
        user_id: user.id,
        product_id: Number(productId),
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    loggerServer.error('Favorites POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
