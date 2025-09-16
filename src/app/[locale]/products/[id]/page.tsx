import ProductImageHoverArea from '@/app/components/ProductImageHoverArea';
import { prisma } from '@/app/lib/db/prisma';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const productId = BigInt(id);
  let product;
  try {
    product = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        images: true,
        categories: true,
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ProductImageHoverArea images={product.images} />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="text-2xl font-semibold text-emerald-600 mb-4">
            {product.sale_price.toString()}₽
          </div>

          <div className="text-sm text-gray-500 mb-4">
            Код: {product.id_from_another_db.toString()}
          </div>

          {product.categories && (
            <div className="text-sm text-gray-500 mb-6">Категория: {product.categories.name}</div>
          )}

          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            Добавить в корзину
          </button>

          {product.description && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Описание</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Опционально: Генерация статических параметов
export async function generateStaticParams() {
  // Если хотите предварительно сгенерировать страницы для некоторых товаров
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    // Добавьте ID товаров, которые хотите предварительно отрендерить
  ];
}
