// app/[locale]/favorites/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import InfiniteProductList from '@/app/[locale]/components/InfiniteProductList';

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen pt-4">
      <div className="container max-w-[84rem] mx-auto">
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">Избранное</h1>
          {session ? (
            <InfiniteProductList
              isEntrance={true}
              isAdmin={session.user.role === 'ADMIN' || false}
              showFavoritesOnly
            />
          ) : (
            <p className="text-center text-gray-600">Войдите, чтобы увидеть избранное.</p>
          )}
        </div>
      </div>
    </div>
  );
}
