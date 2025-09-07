'use client';

import { useCallback, useEffect, useState } from 'react';
import AuthModal from './auth-modal';
import pictureOfAManOnAuthorization from '@/../public/icons/picture-of-a-man-on-authorization.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

const Header = ({ isEntrance }: { isEntrance: boolean }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string>();

  const router = useRouter();

  // Поиск с debounce через API endpoint
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);

        console.log(response);
        if (!response.ok) {
          throw new Error('Search failed');
        }

        const results = await response.json();
        setSearchResults(results.hits);
        console.log(results);
      } catch (err) {
        console.error('Search error:', err);
        setError('Ошибка поиска');
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.refresh();
    } catch (error) {
      setError('Произошла ошибка при выходе');
    }
  };

  return (
    <header
      className="w-full h-full flex justify-between items-center rounded-4xl p-4 gap-4"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Поисковая строка */}
      <div className="flex-1 max-w-md relative">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Поиск игрушек и канцтоваров..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
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

        {/* Выпадающие результаты поиска */}
        {showResults && searchQuery && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">Поиск...</div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map(product => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="flex items-center p-3 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowResults(false)}
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded mr-3">
                      {product.images?.[0] && (
                        <img
                          src={`/uploads/images/${product.images[0]}`}
                          alt={product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">{product.category_name}</div>
                      <div className="text-sm font-bold text-blue-600">{product.sale_price}₽</div>
                    </div>
                  </Link>
                ))}
                <div className="border-t border-gray-200 p-2">
                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery)}`}
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => setShowResults(false)}
                  >
                    Все результаты поиска →
                  </Link>
                </div>
              </div>
            ) : searchQuery ? (
              <div className="p-4 text-center text-gray-500">Ничего не найдено</div>
            ) : null}
          </div>
        )}
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

// Debounce функция
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export default Header;
