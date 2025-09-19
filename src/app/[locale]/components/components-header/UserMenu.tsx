'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import pictureOfAManOnAuthorization from '@/../public/icons/picture-of-a-man-on-authorization.png';
import simpleUser from '@/../public/icons/simple-user.png';
import AuthModal from '@/app/[locale]/components/components-header/components-user-menu/AuthModal';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import logger from '@/lib/logger';

const UserMenu = ({ isEntrance }: { isEntrance: boolean }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showLogoutHint, setShowLogoutHint] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.refresh();
      setShowLogoutHint(false);
    } catch (error) {
      logger.error('Произошла ошибка при выходе', error);
    }
  };

  const handleAvatarClick = () => {
    if (isEntrance) {
      setShowLogoutHint(prev => !prev);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleCloseHint = () => {
    setShowLogoutHint(false);
  };

  return (
    <div className="flex items-center gap-3 relative">
      <div className="relative">
        <button
          onClick={handleAvatarClick}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors mr-5"
        >
          <Image
            src={isEntrance ? pictureOfAManOnAuthorization : simpleUser}
            alt="User avatar"
            className="cursor-pointer w-8 h-8"
          />
        </button>

        {showLogoutHint && (
          <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-[200px]">
            <p className="text-sm text-gray-700 mb-3">Вы хотите выйти из профиля?</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCloseHint}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
              >
                Отмена
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Выйти
              </button>
            </div>
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default UserMenu;
