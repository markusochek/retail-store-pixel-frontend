import ProductContainer from '@/app/[locale]/components/ProductContainer';
import { configureMeilisearch, syncProductsToMeilisearch } from '@/lib/syncProducts';

export default async function Home(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;

  const initialSearchQuery = searchParams.q || '';

  await syncProductsToMeilisearch();
  await configureMeilisearch();

  // const syncProducts = setInterval(async () => {
  //   const products = parseProductsFile('products');
  //   for (const product of products) {
  //     const exists = await prisma.products.findUnique({
  //       where: { id: product.id },
  //     });
  //     if (!exists) {
  //       await prisma.products.create({
  //         data: {
  //           sale_price: product.sale_price,
  //           name: product.name,
  //           id: product.id,
  //           quantity: product.quantity,
  //         },
  //       });
  //     }
  //   }
  // }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto">
        <div className="flex flex-col gap-6">
          <ProductContainer initialSearchQuery={initialSearchQuery} />
        </div>
      </div>
    </div>
  );
}
