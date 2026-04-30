'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductBlock from '@/app/[locale]/components/components-product-container/components-product-container-client/ProductBlock';
import { ProductWithIsFavorite } from '@/types/product';

interface InfiniteProductListProps {
  isEntrance: boolean;
  isAdmin: boolean;
  showFavoritesOnly?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function InfiniteProductList({
  isEntrance,
  isAdmin,
  showFavoritesOnly = false,
}: InfiniteProductListProps) {
  const [products, setProducts] = useState<ProductWithIsFavorite[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const searchParams = useSearchParams();
  const currentQ = searchParams.get('q') || '';

  // Сброс при изменении поискового запроса
  useEffect(() => {
    setProducts([]);
    setCursor(null);
    setPage(1);
    setHasMore(true);
  }, [currentQ]);

  const fetchProducts = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', String(ITEMS_PER_PAGE));
      if (showFavoritesOnly) {
        params.append('favorites', 'true');
      } else if (currentQ) {
        // Режим поиска – передаём page вместо cursor
        params.append('q', currentQ);
        params.append('page', page.toString());
      } else {
        // Обычный режим – передаём cursor
        if (cursor) params.append('cursor', cursor);
      }

      // если это избранное, cursor всё равно нужен для пагинации
      if (showFavoritesOnly && cursor) {
        params.append('cursor', cursor);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');

      // Для неавторизованных обрабатываем избранное из localStorage
      let newProducts: ProductWithIsFavorite[] = data.products;
      if (!isEntrance) {
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
          const favIds: number[] = JSON.parse(storedFavorites);
          newProducts = newProducts.map(p => ({
            ...p,
            isFavorite: favIds.includes(p.id),
          }));
        }
      }

      setProducts(prev => [...prev, ...newProducts]);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
      if (currentQ) {
        setPage(prev => prev + 1); // увеличиваем страницу для поиска
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  }, [cursor, page, hasMore, loading, currentQ, isEntrance, showFavoritesOnly]);

  // Первая загрузка
  useEffect(() => {
    if (products.length === 0 && hasMore) {
      fetchProducts();
    }
  }, [products.length, hasMore, fetchProducts]);

  useEffect(() => {
    setProducts([]);
    setCursor(null);
    setPage(1);
    setHasMore(true);
  }, [currentQ, showFavoritesOnly]);

  // Наблюдатель за нижней границей списка
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProducts();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, loading, fetchProducts]);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map(product => (
          <ProductBlock
            key={product.id}
            id={product.id}
            name={product.name}
            salePrice={product.sale_price}
            quantity={product.quantity}
            images={product.images || []}
            isFavoriteInitialization={product.isFavorite}
            isEntrance={isEntrance}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {/* Sentinel + индикация загрузки */}
      <div ref={observerRef} className="h-10" />
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}
      {!hasMore && products.length > 0 && (
        <p className="text-center py-4 text-gray-500">Все товары загружены</p>
      )}
    </div>
  );
}
