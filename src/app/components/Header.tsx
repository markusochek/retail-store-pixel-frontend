import React from 'react';
import Image from 'next/image';
import logo from '../../../public/icons/logo.svg';
import SearchBar from '@/app/[locale]/components/components-header/SearchBar';
import UserMenu from '@/app/[locale]/components/components-header/UserMenu';
import Favorites from '@/app/[locale]/components/components-header/Favorites';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const Header = async () => {
  const session = await getServerSession(authOptions);

  let favorites = [];
  if (session && session.user && session.user.id) {
    favorites = await prisma.favorites.findMany({
      where: {
        user_id: Number(session.user.id),
      },
    });
  }

  return (
    <header className="bg-white flex justify-between items-center rounded-2xl p-4 shadow-sm border border-gray-100 mx-4 mt-4">
      <Image src={logo} alt="Logo" className="ml-5" />
      <SearchBar />
      <Favorites favoritesCount={favorites.length} />
      <UserMenu />
    </header>
  );
};

export default Header;
