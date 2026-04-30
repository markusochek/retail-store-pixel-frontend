import React from 'react';
import SearchBar from '@/app/components/components-header/SearchBar';
import UserMenu from '@/app/components/components-header/UserMenu';
import Favorites from '@/app/components/components-header/Favorites';
import Basket from '@/app/components/components-header/Basket';
import Logo from '@/app/components/components-header/Logo';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import Orders from '@/app/components/components-header/Orders';

const Header = async () => {
  const session = await getServerSession(authOptions);

  let favorites = [];
  let cartItems = [];
  if (session?.user?.id) {
    favorites = await prisma.favorites.findMany({
      where: { user_id: Number(session.user.id) },
    });
    cartItems = await prisma.cart_items.findMany({
      where: { user_id: Number(session.user.id) },
    });
  }

  return (
    <div className="sticky top-0 z-50">
      <div className="container mx-auto max-w-[84rem] bg-white border border-gray-200 shadow-sm rounded-b-2xl px-4 py-3 flex items-center justify-between">
        <Logo />

        <div className="flex-1 mx-6 md:mx-10 min-w-0">
          <SearchBar />
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <UserMenu />
          <Orders serverCount={favorites.length} />
          <Favorites serverCount={favorites.length} />
          <Basket serverCount={cartItems.length} />
        </div>
      </div>
    </div>
  );
};

export default Header;
