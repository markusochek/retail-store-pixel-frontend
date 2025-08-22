// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {prisma} from "@/app/lib/db/prisma";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;

        if (refreshToken) {
            const user = await prisma.users.findFirst({
                where: { refresh_token: refreshToken },
            });

            if (user) {
                await prisma.users.update({
                    where: { id: user.id },
                    data: { refresh_token: null },
                });
            }
        }

        const response = NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 }
        );

        // Очищаем cookie
        response.cookies.set('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0,
        });

        return response;

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}