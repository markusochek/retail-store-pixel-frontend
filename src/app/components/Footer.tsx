import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../../public/icons/logo.svg';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Лого и описание */}
          <div className="flex flex-col items-center md:items-start">
            <Image src={logo} alt="Pixel" className={'w-60 h-16'} />
            <p className="mt-4 text-gray-400 text-sm text-center md:text-left">
              Интернет-магазин игрушек и канцтоваров
            </p>
          </div>

          {/* Навигация */}
          <div className="flex flex-col items-center">
            <h3 className="font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2 text-sm text-gray-400 text-center">
              <li>
                <Link href="/public" className="hover:text-white transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Все товары
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  О магазине
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="hover:text-white transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="font-semibold mb-4">Контакты</h3>
            <div className="space-y-2 text-sm text-gray-400 text-center md:text-right">
              <p>📞 +7 (999) 123-45-67</p>
              <p>✉️ info@pixel-store.ru</p>
              <p>🕒 Ежедневно 9:00-21:00</p>
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Pixel Store. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
