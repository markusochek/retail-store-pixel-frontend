import logo from '../../../public/icons/logo.svg';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import UserMenu from '@/components/UserMenu';

const Header = ({
  isEntrance,
  initialSearchQuery,
}: {
  isEntrance: boolean;
  initialSearchQuery: string;
}) => {
  return (
    <header className="bg-white flex justify-between items-center rounded-2xl p-4 shadow-sm border border-gray-100">
      <Image src={logo} alt="Logo" className={'ml-5'} />
      <SearchBar initialSearchQuery={initialSearchQuery} />
      <UserMenu isEntrance={isEntrance} />
    </header>
  );
};

export default Header;
