import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Header from '@/app/[locale]/components/Header';
import ProductContainer from '@/app/[locale]/components/ProductContainer';
import { configureMeilisearch, syncProductsToMeilisearch } from '@/lib/syncProducts';

export default async function Home(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const [session, resolvedSearchParams] = await Promise.all([
    getServerSession(authOptions),
    searchParams,
  ]);

  const initialSearchQuery = resolvedSearchParams.q || '';

  await syncProductsToMeilisearch();
  await configureMeilisearch();

  // const syncProducts = setInterval(async () => {
  //   const products = parseProductsFile('products');
  //   for (const product of products) {
  //     const exists = await prisma.products.findUnique({
  //       where: { id_from_another_db: product.id_from_another_db },
  //     });
  //     if (!exists) {
  //       await prisma.products.create({
  //         data: {
  //           sale_price: product.sale_price,
  //           name: product.name,
  //           id_from_another_db: product.id_from_another_db,
  //           quantity: product.quantity,
  //         },
  //       });
  //     }
  //   }
  // }, 100000);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <Header isEntrance={!!session} initialSearchQuery={initialSearchQuery} />
          <ProductContainer initialSearchQuery={initialSearchQuery} />
        </div>
      </div>
    </div>
  );
}
