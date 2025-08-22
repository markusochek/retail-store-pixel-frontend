import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/app/lib/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.users.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    new TextDecoder().decode(user.password)
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id.toString(),
                    email: user.email,
                    roleId: user.role_id?.toString(),
                };
            }
        })
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 дней
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.roleId = user.roleId
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.sub!;
                session.user.roleId = token.roleId as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
        signUp: '/auth/register',
    },
});

export { handler as GET, handler as POST };