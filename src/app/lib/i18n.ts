// app/lib/i18n.ts
import { getRequestConfig } from 'next-intl/server';

export const locales = ['ru', 'en'] as const;
export const defaultLocale = 'ru' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  let verifyLocale = locale as Locale;
  if (!locales.includes(verifyLocale)) {
    verifyLocale = 'ru';
  }

  return {
    locale: verifyLocale,
    messages: (await import(`../../../messages/${verifyLocale}.json`)).default,
    timeZone: 'Europe/Samara',
    now: new Date(),
  };
});
