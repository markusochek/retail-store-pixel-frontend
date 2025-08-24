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
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#F5F7FA',
      }}
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', marginLeft: '10%', marginRight: '10%' }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Header isEntrance={!!session} />
        </div>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <ProductContainer></ProductContainer>
        </div>
      </div>
    </div>
  );
}
