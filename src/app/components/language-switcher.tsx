'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchLanguage = (locale: string) => {
    const segments = pathname.split('/');
    segments[1] = locale; // Заменяем текущую локаль
    router.push(segments.join('/'));
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => switchLanguage('ru')}
        className={`px-2 py-1 rounded text-sm ${
          currentLocale === 'ru'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        RU
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={`px-2 py-1 rounded text-sm ${
          currentLocale === 'en'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
