'use client';

import { useState } from 'react';
import AuthModal from './auth-modal';
import pictureOfAManOnAuthorization from '@/../public/icons/picture-of-a-man-on-authorization.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

const Header = ({ isEntrance }: { isEntrance: boolean }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [error, setError] = useState();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.refresh();
    } catch (error) {
      setError('Произошла ошибка при входе');
    }
  };

  return (
    <header className="flex justify-end items-center p-4 gap-4">
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
