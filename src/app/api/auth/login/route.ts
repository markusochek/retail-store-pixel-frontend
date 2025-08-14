import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import {prisma} from "@/app/lib/db/connect-db";

export async function POST(request: { json: () => PromiseLike<{ email: any; password: any; }> | { email: any; password: any; }; }) {
    const { email, password } = await request.json();

    try {
        const user = await prisma.users.findUnique({where: {email}});

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Неверный email или пароль" },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password.toString());

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: "Неверный email или пароль" },
                { status: 401 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { success: false, message: "Ошибка сервера" },
            { status: 500 }
        );
    }

    // В реальном проекте здесь создается JWT-токен или сессия
    return NextResponse.json({ success: true });
}