import { redirect } from 'next/navigation';
import { defaultLocale } from '@/app/lib/i18n';

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
