import ProductContainer from '@/app/product-container';
import Header from '@/app/header';
import { prisma } from '@/app/lib/db/prisma';
import { parseProductsFile } from '@/app/lib/helpers/parse-products-files';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function Home() {
  const session = await getServerSession(authOptions);

  const syncProducts = setInterval(async () => {
    const products = parseProductsFile('products');

    for (const product of products) {
      const exists = await prisma.products.findUnique({
        where: { id_from_another_db: product.id_from_another_db },
      });

      if (!exists) {
        await prisma.products.create({
          data: {
            sale_price: product.sale_price,
            name: product.name,
            id_from_another_db: product.id_from_another_db,
          },
        });
      }
    }
  }, 100000);

  return (
    <div className={'flex flex-row flex-wrap justify-center bg-gray-100'}>
      <div className={'flex flex-col mx-[10%] gap-[0.5%]'}>
        <Header isEntrance={!!session} />
        <ProductContainer></ProductContainer>
      </div>
    </div>
  );
}
