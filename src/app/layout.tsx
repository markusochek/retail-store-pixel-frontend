// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { defaultLocale, Locale, locales } from '@/app/lib/i18n';

export const metadata: Metadata = {
  title: 'Pixel',
  description: 'Pixel stone',
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;

  // Вместо notFound() используем default locale если переданный невалиден
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;

  const messages = await getMessages();

  return (
    <html lang={validLocale}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}
