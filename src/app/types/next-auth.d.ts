import NextAuth from 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            id: number
            role: string
        } & DefaultSession['user']
    }

    interface User {
        id: number
        email: string
        roleId: number
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: string
    }
}