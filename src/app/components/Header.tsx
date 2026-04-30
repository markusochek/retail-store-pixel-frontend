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
import Home from '@/app/components/components-header/Home';

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
      <div className="container mx-auto max-w-[84rem] bg-white border border-gray-200 shadow-sm rounded-b-2xl px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-y-3">
          <div className="hidden md:block">
            <Logo />
          </div>

          <div className="w-full md:w-auto md:flex-1 md:mx-6 lg:mx-10 min-w-0 order-last md:order-none">
            <SearchBar />
          </div>

          {/* Десктопная группа (показывается только на md и выше) */}
          <div className="hidden md:flex items-center gap-3 md:gap-5">
            <UserMenu />
            <Orders serverCount={favorites.length} />
            <Favorites serverCount={favorites.length} />
            <Basket serverCount={cartItems.length} />
          </div>
        </div>
      </div>

      {/* Мобильная нижняя панель (показывается только на экранах меньше md) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center h-14 md:hidden">
        <UserMenu />
        <Orders serverCount={favorites.length} />
        <Home />
        <Favorites serverCount={favorites.length} />
        <Basket serverCount={cartItems.length} />
      </nav>
    </div>
  );
};

export default Header;
