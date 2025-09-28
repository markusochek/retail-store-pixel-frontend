'use client';

import Image from 'next/image';
import magnifier from '../../../../public/icons/magnifier.svg';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const SearchBar = () => {
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const router = useRouter();

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

  return (
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
  );
};

export default SearchBar;
