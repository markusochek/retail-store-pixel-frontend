import { prisma } from './db/prisma';
import { meilisearchAdminClient, productsIndexAdmin } from './meilisearch';

export async function syncProductsToMeilisearch() {
  try {
    console.log('Начинаем синхронизацию с Meilisearch...');

    const products = await prisma.products.findMany({
      include: {
        categories: true,
        images: true,
      },
    });

    console.log(`Найдено ${products.length} продуктов в базе данных`);

    const documents = products.map(product => ({
      id: product.id.toString(),
      name: product.name,
      description: product.description || '',
      sale_price: parseFloat(product.sale_price.toString()),
      category_id: product.category_id.toString(),
      category_name: product.categories?.name || 'Разные игрушки',
      images: product.images.map(img => img.path_to_image),
      id_from_another_db: product.id_from_another_db.toString(),
    }));

    console.log('Подготавливаем документы для загрузки...');

    // Очищаем индекс перед загрузкой новых данных
    console.log('Очищаем индекс...');
    const deleteTask = await productsIndexAdmin.deleteAllDocuments();
    await meilisearchAdminClient.tasks.waitForTask(deleteTask.taskUid);
    console.log('Индекс очищен');

    // Загружаем документы с указанием primary key
    console.log('Загружаем документы...');
    const task = await productsIndexAdmin.addDocuments(documents, {
      primaryKey: 'id', // ← ВАЖНО: указываем primary key вручную
    });

    console.log('Задача добавления документов создана:', task.taskUid);

    // Ждем завершения задачи
    console.log('Ожидаем завершения задачи...');
    const completedTask = await meilisearchAdminClient.tasks.waitForTask(task.taskUid);

    console.log('Статус задачи:', completedTask.status);
    console.log('Детали задачи:', {
      status: completedTask.status,
      type: completedTask.type,
      receivedDocuments: completedTask.details?.receivedDocuments,
      indexedDocuments: completedTask.details?.indexedDocuments,
    });

    if (completedTask.status === 'failed') {
      console.error('Задача завершилась с ошибкой:', completedTask.error);
      throw new Error(completedTask.error?.message || 'Task failed');
    }

    console.log('Документы успешно загружены!');

    // Проверяем количество документов
    const stats = await productsIndexAdmin.getStats();
    console.log('Статистика индекса:', stats);

    return stats;
  } catch (error) {
    console.error('Ошибка синхронизации с Meilisearch:', error);
    throw error;
  }
}

export async function configureMeilisearch() {
  try {
    await productsIndexAdmin.updateSettings({
      // Поля для поиска (в порядке приоритета)
      searchableAttributes: ['name', 'category_name', 'description'],

      // Поля для отображения в результатах
      displayedAttributes: [
        'id',
        'name',
        'sale_price',
        'category_name',
        'images',
        'id_from_another_db',
      ],

      // Поля для фильтрации
      filterableAttributes: ['category_name', 'sale_price'],

      // Поля для сортировки
      sortableAttributes: ['sale_price', 'name'],

      // Правила релевантности (очень важны для игрушек!)
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],

      // Синонимы для игрушек и брендов
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

        // Бренды
        'eastern express': ['eastern', 'express'],
        'western express': ['western', 'express'],
        pandora: ['пандора'],
        pikachu: ['пикачу', 'покемон'],
        stitch: ['стич', 'лич'],
        glock: ['глок'],

        // Размеры
        см: ['сантиметр', 'сантиметров'],
        '35см': ['35 сантиметров', '35 см'],
        '45см': ['45 сантиметров', '45 см'],
      },

      // Настройки устойчивости к опечаткам (важно для детских поисков!)
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 4, // Слова от 4 букв - 1 опечатка
          twoTypos: 8, // Слова от 8 букв - 2 опечатки
        },
        disableOnWords: [
          'cm',
          'см',
          'арт', // Не исправлять размеры и артикулы
        ],
      },

      // Настройки разделителей слов
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

    console.log('Meilisearch настроен для магазина игрушек!');
  } catch (error) {
    console.error('Ошибка настройки Meilisearch:', error);
  }
}
