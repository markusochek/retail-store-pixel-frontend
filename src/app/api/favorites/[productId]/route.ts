import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import loggerServer from '@/lib/logger/logger-server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
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

    const existingFavorite = await prisma.favorites.findUnique({
      where: {
        user_id_product_id: {
          user_id: user.id,
          product_id: parseInt(productId),
        },
      },
    });

    if (!existingFavorite) {
      return NextResponse.json({ error: 'Товар не найден в избранном' }, { status: 404 });
    }

    await prisma.favorites.delete({
      where: {
        user_id_product_id: {
          user_id: user.id,
          product_id: parseInt(productId),
        },
      },
    });

    return NextResponse.json({ message: 'Товар удален из избранного' });
  } catch (error) {
    loggerServer.error('Favorites DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
