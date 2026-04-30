// app/[locale]/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import InfiniteProductList from '@/app/[locale]/components/InfiniteProductList';
import { triggerSyncIfNeeded } from '@/lib/syncProducts/trigger';

export default async function Home() {
  const session = await getServerSession(authOptions);

  await triggerSyncIfNeeded();

  return (
    <div className="min-h-screen pt-4">
      <div className="container max-w-[84rem] mx-auto">
        <div className="flex flex-col gap-6">
          <InfiniteProductList
            isEntrance={!!session}
            isAdmin={session?.user?.role === 'ADMIN' || false}
          />
        </div>
      </div>
    </div>
  );
}
