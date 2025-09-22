// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import NextAuthProvider from '@/app/components/NextAuthProvider';

export const metadata: Metadata = {
  title: 'Pixel',
  description: 'Pixel stone',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html>
      <body className="flex flex-col min-h-screen">
        <NextAuthProvider session={session}>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  );
}
