'use client';

import { useState } from 'react';
import pictureOfAManOnAuthorization from '../../../public/icons/picture-of-a-man-on-authorization.png';
import logo from '../../../public/icons/logo.svg';
import magnifier from '../../../public/icons/magnifier.svg';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import AuthModal from '@/app/[locale]/AuthModal';

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
    // header.tsx
    <header className="bg-white flex justify-between items-center rounded-2xl p-4 shadow-sm border border-gray-100">
      <Image src={logo} alt="Logo" className={'ml-5'} />
      <div className="flex-1 max-w-xl mx-4">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center bg-white border border-gray-300 rounded-xl p-1 shadow-sm hover:shadow-md transition-shadow"
        >
          <input
            type="text"
            placeholder="Поиск игрушек и канцтоваров..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 p-3 pl-4 pr-2 rounded-xl border-none outline-none text-sm"
          />
          <button
            type="submit"
            className="flex justify-center items-center w-12 h-10 bg-[#D83232] rounded-xl hover:bg-red-600 transition-colors cursor-pointer ml-1"
          >
            <Image src={magnifier} alt={'Поиск'} className="h-5 w-5 filter invert" />
          </button>
        </form>
      </div>

      <div className="flex items-center gap-3">
        {isEntrance ? (
          <div className="flex items-center gap-3">
            <Image
              src={pictureOfAManOnAuthorization}
              alt="User avatar"
              width={45}
              height={45}
              className={'mr-5'}
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Войти
          </button>
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
