import { prisma } from './db/prisma';
import { meilisearchAdminClient, productsIndexAdmin } from './meilisearch';

function detectCategory(name: string): string {
  const lowerName = name.toLowerCase();

  if (
    lowerName.includes('железная дорога') ||
    lowerName.includes('поезд') ||
    lowerName.includes('train')
  ) {
    return 'Железные дороги';
  }
  if (lowerName.includes('кукла') || lowerName.includes('doll') || lowerName.includes('барби')) {
    return 'Куклы';
  }
  if (
    lowerName.includes('мягкая игрушка') ||
    lowerName.includes('плюш') ||
    lowerName.includes('игрушка')
  ) {
    return 'Мягкие игрушки';
  }
  if (
    lowerName.includes('робот') ||
    lowerName.includes('трансформер') ||
    lowerName.includes('robot')
  ) {
    return 'Роботы и трансформеры';
  }
  if (
    lowerName.includes('пистолет') ||
    lowerName.includes('бластер') ||
    lowerName.includes('gun')
  ) {
    return 'Оружие и бластеры';
  }
  if (
    lowerName.includes('мяч') ||
    lowerName.includes('ball') ||
    lowerName.includes('футбольный') ||
    lowerName.includes('баскетбольный')
  ) {
    return 'Мячи';
  }
  if (lowerName.includes('набор') || lowerName.includes('set') || lowerName.includes('комплект')) {
    if (lowerName.includes('космети') || lowerName.includes('makeup')) return 'Наборы косметики';
    if (lowerName.includes('посуда') || lowerName.includes('kitchen')) return 'Наборы посуды';
    return 'Наборы';
  }
  if (
    lowerName.includes('антистресс') ||
    lowerName.includes('сквиш') ||
    lowerName.includes('squish')
  ) {
    return 'Антистресс игрушки';
  }
  if (
    lowerName.includes('музыкальный') ||
    lowerName.includes('звук') ||
    lowerName.includes('music')
  ) {
    return 'Музыкальные игрушки';
  }
  if (lowerName.includes('мыльные пузыри') || lowerName.includes('bubble')) {
    return 'Мыльные пузыри';
  }

  return 'Разные игрушки';
}

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

// Вспомогательные функции для извлечения информации из названия
function extractKeywords(name: string): string[] {
  const keywords = [];
  const lowerName = name.toLowerCase();

  // Извлекаем размеры
  const sizeMatch = lowerName.match(/(\d+)см/);
  if (sizeMatch) keywords.push(`размер ${sizeMatch[1]}см`);

  // Извлекаем материалы
  if (lowerName.includes('метал')) keywords.push('металлический');
  if (lowerName.includes('мягк')) keywords.push('мягкий');
  if (lowerName.includes('музык')) keywords.push('музыкальный');
  if (lowerName.includes('свет')) keywords.push('светящийся');
  if (lowerName.includes('звук')) keywords.push('со звуком');

  // Извлекаем бренды и серии
  if (lowerName.includes('eastern express')) keywords.push('eastern express');
  if (lowerName.includes('western express')) keywords.push('western express');
  if (lowerName.includes('pandora')) keywords.push('pandora');
  if (lowerName.includes('pikachu') || lowerName.includes('пикачу')) keywords.push('пикачу');
  if (lowerName.includes('stitch') || lowerName.includes('стич')) keywords.push('стич');

  return keywords;
}

function extractSize(name: string): string {
  const match = name.match(/(\d+)см/);
  return match ? `${match[1]}см` : '';
}

function extractMaterial(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('метал')) return 'металл';
  if (lowerName.includes('плюш') || lowerName.includes('мягк')) return 'плюш';
  if (lowerName.includes('пластик')) return 'пластик';
  return '';
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

      // Настройки стемминга (для русского языка)
      // Meilisearch автоматически поддерживает русский язык
    });

    console.log('Meilisearch настроен для магазина игрушек!');
  } catch (error) {
    console.error('Ошибка настройки Meilisearch:', error);
  }
}
