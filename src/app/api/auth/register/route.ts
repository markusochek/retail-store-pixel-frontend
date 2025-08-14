import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import {prisma} from "@/app/lib/db/connect-db";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const isUserCreated = await prisma.users.findUnique({where: {email}});

        if (isUserCreated) {
            return NextResponse.json(
                { success: false, message: "Пользователь уже существует" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 16);

        await prisma.users.create({data: {
            email,
            password: new TextEncoder().encode(hashedPassword),
        }});

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { success: false, message: "Ошибка сервера" },
            { status: 500 }
        );
    }
}