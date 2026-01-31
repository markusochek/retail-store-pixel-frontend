import React from 'react';
import SearchBar from '@/app/components/components-header/SearchBar';
import UserMenu from '@/app/components/components-header/UserMenu';
import Favorites from '@/app/components/components-header/Favorites';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Logo from '@/app/components/components-header/Logo';
import Basket from '@/app/components/components-header/Basket';

const Header = async () => {
  const session = await getServerSession(authOptions);

  let favorites = [];
  let cartItems = [];
  if (session && session.user && session.user.id) {
    favorites = await prisma.favorites.findMany({
      where: {
        user_id: Number(session.user.id),
      },
    });

    cartItems = await prisma.cart_items.findMany({
      where: {
        user_id: Number(session.user.id),
      },
    });
  }

  return (
    <header className="bg-white flex justify-between items-center rounded-2xl p-4 shadow-sm border border-gray-100 mx-4 mt-4">
      <Logo />
      <SearchBar />
      <Basket serverCount={cartItems.length} />
      <Favorites serverCount={favorites.length} />
      <UserMenu />
    </header>
  );
};

export default Header;
