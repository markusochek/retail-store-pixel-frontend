import ProductContainerFavorites from '@/app/[locale]/favorites/components/ProductContainerFavorites';

export default async function Home(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;

  const initialSearchQuery = searchParams.q || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto">
        <div className="flex flex-col gap-6">
          <ProductContainerFavorites initialSearchQuery={initialSearchQuery} />
        </div>
      </div>
    </div>
  );
}
