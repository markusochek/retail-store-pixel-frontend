import { prisma } from './db/prisma';
import { meilisearchAdminClient, productsIndexAdmin } from './meilisearch';
import loggerServer from '@/lib/logger/logger-server';

export async function syncProductsToMeilisearch() {
  try {
    const products = await prisma.products.findMany({
      include: {
        categories: true,
        images: true,
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
      id_from_another_db: product.id_from_another_db.toString(),
      quantity: product.quantity,
    }));

    const deleteTask = await productsIndexAdmin.deleteAllDocuments();
    await meilisearchAdminClient.tasks.waitForTask(deleteTask.taskUid, { timeout: 30000 });

    const task = await productsIndexAdmin.addDocuments(documents, {
      primaryKey: 'id',
    });

    const completedTask = await meilisearchAdminClient.tasks.waitForTask(task.taskUid, {
      timeout: 30000,
    });

    if (completedTask.status === 'failed') {
      loggerServer.error('Задача завершилась с ошибкой:', completedTask.error);
      throw new Error(completedTask.error?.message || 'Task failed');
    }

    return await productsIndexAdmin.getStats();
  } catch (error) {
    loggerServer.error('Ошибка синхронизации с Meilisearch:', error);
    throw error;
  }
}

export async function configureMeilisearch() {
  try {
    await productsIndexAdmin.updateSettings({
      searchableAttributes: ['name', 'category_name', 'description'],

      displayedAttributes: [
        'id',
        'name',
        'sale_price',
        'category_name',
        'images',
        'id_from_another_db',
        'quantity',
      ],

      filterableAttributes: ['category_name', 'sale_price'],

      sortableAttributes: ['sale_price', 'name'],

      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],

      synonyms: {
        'железная дорога': ['поезд', 'рельсы', 'жд'],
        кукла: ['пупс', 'барби', 'кукла-шар'],
        'мягкая игрушка': ['плюшевая игрушка', 'плюш', 'мягкая'],
        робот: ['трансформер', 'робот-трансформер'],
        пистолет: ['бластер', 'водный пистолет', 'water gun'],
        мяч: ['ball', 'футбольный мяч', 'баскетбольный мяч'],
        набор: ['комплект', 'set'],
        косметика: ['makeup', 'макияж'],
        антистресс: ['сквиш', 'squish', 'антистресс игрушка'],
        музыкальный: ['звуковой', 'со звуком', 'поющий'],
        метал: ['металлический', 'metal'],

        'eastern express': ['eastern', 'express'],
        'western express': ['western', 'express'],
        pandora: ['пандора'],
        pikachu: ['пикачу', 'покемон'],
        stitch: ['стич', 'лич'],
        glock: ['глок'],

        см: ['сантиметр', 'сантиметров'],
        '35см': ['35 сантиметров', '35 см'],
        '45см': ['45 сантиметров', '45 см'],
      },

      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 4,
          twoTypos: 8,
        },
        disableOnWords: ['cm', 'см', 'арт'],
      },

      separatorTokens: [
        ' ',
        '-',
        '/',
        '\\',
        "'",
        '"',
        '(',
        ')',
        '[',
        ']',
        '{',
        '}',
        '.',
        ',',
        ';',
        ':',
        '!',
        '?',
        '*',
        '#',
        '$',
        '%',
        '&',
        '+',
        '=',
      ],
    });
  } catch (error) {
    loggerServer.error('Ошибка настройки Meilisearch:', error);
  }
}
