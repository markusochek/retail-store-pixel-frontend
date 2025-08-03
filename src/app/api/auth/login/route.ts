import { NextResponse } from "next/server";
import {diContainer} from "@/app/lib/di/di-container";
import bcrypt from "bcrypt";

export async function POST(request: { json: () => PromiseLike<{ email: any; password: any; }> | { email: any; password: any; }; }) {
    const { email, password } = await request.json();

    const userService = await diContainer.getUserService();

    try {
        const user = await userService.findByEmail(email);

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