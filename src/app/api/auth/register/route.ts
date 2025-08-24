import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/app/lib/db/prisma';
import { generateAccessToken, generateRefreshToken } from '@/app/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.users.create({
      data: {
        email,
        password: new TextEncoder().encode(hashedPassword),
      },
    });

    const accessToken = generateAccessToken({
      userId: Number(user.id),
      email: user.email,
      roleId: Number(user.role_id),
    });
    const refreshToken = generateRefreshToken({
      userId: Number(user.id),
      email: user.email,
      roleId: Number(user.role_id),
    });

    await prisma.users.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken },
    });

    const response = NextResponse.json(
      {
        user: { id: user.id.toString(), email: user.email },
        accessToken,
      },
      { status: 201 }
    );

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
