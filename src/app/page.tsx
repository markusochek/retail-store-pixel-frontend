import ProductContainer from '@/app/product-container';
import Header from '@/app/header';
import { prisma } from '@/app/lib/db/prisma';
import { parseProductsFile } from '@/app/lib/helpers/parse-products-files';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function Home() {
  const session = await getServerSession(authOptions);

  const intervalRequestProductsFile = setInterval(async () => {
    const productsFromFile = parseProductsFile('products');
    for (const productFromFile of productsFromFile) {
      const existingProduct = await prisma.products.findUnique({
        where: { id_from_another_db: productFromFile.id_from_another_db },
      });

      if (!existingProduct) {
        await prisma.products.create({ data: productFromFile });
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
