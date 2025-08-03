import { NextResponse } from "next/server";
import {diContainer} from "@/app/lib/di/di-container";
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    const userService = await diContainer.getUserService();

    try {
        const { email, password } = await request.json();

        const isUserCreated = await userService.existsByEmail(email);

        if (isUserCreated) {
            return NextResponse.json(
                { success: false, message: "Пользователь уже существует" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 16);

        await userService.create({
            email,
            password: hashedPassword,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { success: false, message: "Ошибка сервера" },
            { status: 500 }
        );
    }
}