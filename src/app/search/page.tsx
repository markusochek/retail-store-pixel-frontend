import { productsIndex } from '@/app/lib/meilisearch';

export default async function SearchPage({ searchParams }: { searchParams: { q: string } }) {
  let results: any[] = [];

  if (searchParams.q) {
    const searchResults = await productsIndex.search(searchParams.q, {
      attributesToRetrieve: ['id', 'name', 'sale_price', 'images', 'category_name'],
      limit: 50,
    });
    results = searchResults.hits;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Результаты поиска: {searchParams.q}</h1>
        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {results.map(product => (
              <div key={product.id} className="bg-white rounded-lg p-4 shadow">
                {/* Ваш компонент продукта */}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Ничего не найдено</p>
        )}
      </div>
    </div>
  );
}
