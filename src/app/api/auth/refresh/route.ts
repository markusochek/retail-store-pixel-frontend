import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {generateAccessToken, generateRefreshToken, verifyRefreshToken} from "@/app/lib/jwt";
import {prisma} from "@/app/lib/db/prisma";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { error: 'Refresh token required' },
                { status: 401 }
            );
        }

        let payload;
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid refresh token' },
                { status: 401 }
            );
        }

        const user = await prisma.users.findUnique({
            where: { id: Number(payload.userId) },
        });

        if (!user || user.refresh_token !== refreshToken) {
            return NextResponse.json(
                { error: 'Invalid refresh token' },
                { status: 401 }
            );
        }

        const newAccessToken = generateAccessToken({ userId: Number(user.id), email: user.email, roleId: Number(user.role_id) });
        const newRefreshToken = generateRefreshToken({ userId: Number(user.id), email: user.email, roleId: Number(user.role_id) });

        await prisma.users.update({
            where: { id: user.id },
            data: { refresh_token: newRefreshToken },
        });

        const response = NextResponse.json(
            { accessToken: newAccessToken },
            { status: 200 }
        );

        response.cookies.set('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60,
        });

        return response;

    } catch (error) {
        console.error('Refresh error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}