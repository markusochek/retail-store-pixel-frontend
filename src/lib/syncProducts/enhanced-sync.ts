// lib/syncProducts/enhanced-sync.ts
import { prisma } from '@/lib/db/prisma';
import { meilisearchAdminClient, productsIndexAdmin } from '@/lib/meilisearch';
import loggerServer from '@/lib/logger/logger-server';

export async function syncEnhancedProductsToMeilisearch() {
  try {
    const products = await prisma.products.findMany({
      include: {
        categories: true,
        images: true,
        favorites: {
          select: { user_id: true },
        },
        // orders_items нет в схеме, убираем
      },
    });

    const documents = products.map(product => ({
      id: product.id.toString(),
      name: product.name,
      description: product.description || '',
      sale_price: parseFloat(product.sale_price.toString()),
      category_id: product.category_id.toString(),
      category_name: product.categories?.name || 'Разные игрушки',
      images: product.images.map(img => img.path_to_image),
      quantity: product.quantity,

      // Новые поля для улучшения поиска
      tags: extractTags(product.name, product.description),
      popularity: calculatePopularity(product),
      search_boost: calculateSearchBoost(product),

      // Мета-данные для фильтров
      price_range: getPriceRange(parseFloat(product.sale_price.toString())),
      stock_status: product.quantity > 0 ? 'in_stock' : 'out_of_stock',
    }));

    // Используем updateDocuments вместо deleteAllDocuments + addDocuments
    const task = await productsIndexAdmin.updateDocuments(documents, {
      primaryKey: 'id',
    });

    const completedTask = await meilisearchAdminClient.tasks.waitForTask(task.taskUid, {
      timeout: 60000,
    });

    if (completedTask.status === 'failed') {
      loggerServer.error('Синхронизация завершилась ошибкой:', completedTask.error);
      throw new Error(completedTask.error?.message || 'Sync failed');
    }

    loggerServer.info('Успешная синхронизация продуктов', {
      count: documents.length,
      taskId: completedTask.uid,
    });

    return await productsIndexAdmin.getStats();
  } catch (error) {
    loggerServer.error('Ошибка расширенной синхронизации:', error);
    throw error;
  }
}

// Вспомогательные функции
function extractTags(name: string, description: string | null): string[] {
  const tags = new Set<string>();

  // Извлекаем ключевые слова из названия
  const nameWords = name
    .toLowerCase()
    .split(/[\s\-.,]+/)
    .filter(word => word.length > 2);

  nameWords.forEach(word => tags.add(word));

  // Добавляем категориальные теги на основе ваших товаров
  const categoryKeywords = [
    { keyword: 'конструктор', tag: 'конструктор' },
    { keyword: 'кукла', tag: 'кукла' },
    { keyword: 'машинка', tag: 'машинка' },
    { keyword: 'мягк', tag: 'мягкая игрушка' },
    { keyword: 'поезд', tag: 'железная дорога' },
    { keyword: 'пистолет', tag: 'оружие' },
    { keyword: 'робот', tag: 'трансформер' },
    { keyword: 'мяч', tag: 'мяч' },
    { keyword: 'косметик', tag: 'косметика' },
    { keyword: 'набор', tag: 'набор' },
    { keyword: 'антистресс', tag: 'антистресс' },
    { keyword: 'сквиш', tag: 'сквиш' },
    { keyword: 'музыкальн', tag: 'музыкальный' },
    { keyword: 'метал', tag: 'металлический' },
    { keyword: 'пузыр', tag: 'мыльные пузыри' },
  ];

  const lowerName = name.toLowerCase();
  categoryKeywords.forEach(({ keyword, tag }) => {
    if (lowerName.includes(keyword)) {
      tags.add(tag);
    }
  });

  return Array.from(tags);
}

function calculatePopularity(product: any): number {
  const favoriteCount = product.favorites.length;
  // orders_items нет в схеме, используем только favorites
  return favoriteCount * 2;
}

function calculateSearchBoost(product: any): number {
  let boost = 1.0;

  // Увеличиваем вес для товаров в наличии
  if (product.quantity > 0) boost *= 1.5;

  // Увеличиваем вес для популярных товаров
  const popularity = calculatePopularity(product);
  if (popularity > 5) boost *= 1.2;

  return boost;
}

function getPriceRange(price: number): string {
  if (price < 500) return 'budget';
  if (price < 2000) return 'medium';
  if (price < 5000) return 'premium';
  return 'luxury';
}
