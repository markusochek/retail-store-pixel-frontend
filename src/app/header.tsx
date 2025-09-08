'use client';

import { useState } from 'react';
import AuthModal from './auth-modal';
import pictureOfAManOnAuthorization from '@/../public/icons/picture-of-a-man-on-authorization.png';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';

const Header = ({
  isEntrance,
  searchQuery: initialSearchQuery,
}: {
  isEntrance: boolean;
  searchQuery: string;
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    } else {
      params.delete('q');
    }

    router.push(`/?${params.toString()}`);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.refresh();
    } catch (error) {
      console.error('Произошла ошибка при выходе');
    }
  };

  return (
    <header
      className="w-full h-full flex justify-between items-center rounded-4xl p-4 gap-4"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Поисковая строка */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Поиск игрушек и канцтоваров..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>
      </div>

      {/* Правая часть с авторизацией */}
      <div className="flex items-center gap-4">
        {isEntrance ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src={pictureOfAManOnAuthorization}
                alt="User avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
            >
              Выйти
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
            onClick={() => setIsAuthModalOpen(true)}
          >
            <Image src={pictureOfAManOnAuthorization} alt="Login" width={24} height={24} />
            <span className="text-sm">Войти</span>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
        }}
      />
    </header>
  );
};

export default Header;
