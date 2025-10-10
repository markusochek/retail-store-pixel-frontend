// lib/syncProducts/enhanced-settings.ts
import { productsIndexAdmin } from '@/lib/meilisearch';
import loggerServer from '@/lib/logger/logger-server';

export async function configureEnhancedMeilisearch() {
  try {
    await productsIndexAdmin.updateSettings({
      searchableAttributes: ['name', 'category_name', 'description', 'tags'],

      displayedAttributes: [
        'id',
        'name',
        'sale_price',
        'category_name',
        'images',
        'quantity',
        'description',
        'tags',
        'popularity',
        'price_range',
        'stock_status',
      ],

      filterableAttributes: [
        'category_name',
        'sale_price',
        'quantity',
        'tags',
        'price_range',
        'stock_status',
      ],

      sortableAttributes: ['sale_price', 'name', 'quantity', 'popularity'],

      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
        'popularity:desc',
      ],

      synonyms: {
        // Основные категории
        канцелярия: ['канцтовары', 'канцелярские товары', 'письменные принадлежности'],
        игрушка: ['игровой набор', 'детская игрушка', 'развивающая игрушка'],

        // Конструкторы и железные дороги
        конструктор: ['сборная модель', 'строительный набор'],
        'железная дорога': ['поезд', 'рельсы', 'жд', 'железнодорожный'],
        'eastern express': ['eastern', 'express'],
        'western express': ['western', 'express'],

        // Куклы
        кукла: ['пупс', 'барби', 'кукла-шар'],
        barbie: ['барби'],

        // Мягкие игрушки
        'мягкая игрушка': ['плюшевая игрушка', 'плюш', 'мягкая'],
        капибара: ['водосвинка'],
        стич: ['лич'],
        пикачу: ['покемон'],

        // Оружие и техника
        пистолет: ['бластер', 'водный пистолет', 'water gun', 'револьвер'],
        робот: ['трансформер', 'робот-трансформер'],
        машинка: ['автомобиль', 'тачка', 'truck'],

        // Спорт
        мяч: ['ball', 'футбольный мяч', 'баскетбольный мяч', 'волейбольный мяч'],

        // Косметика и наборы
        косметика: ['makeup', 'макияж'],
        набор: ['комплект', 'set'],

        // Антистресс
        антистресс: ['сквиш', 'squish', 'антистресс игрушка'],
        'поп ит': ['popit', 'попит'],

        // Музыкальные
        музыкальный: ['звуковой', 'со звуком', 'поющий'],

        // Материалы
        метал: ['металлический', 'metal'],
        glock: ['глок'],

        // Размеры
        см: ['сантиметр', 'сантиметров'],
        '35см': ['35 сантиметров', '35 см'],
        '45см': ['45 сантиметров', '45 см'],
        '50см': ['50 сантиметров', '50 см'],
        '55см': ['55 сантиметров', '55 см'],
        '70см': ['70 сантиметров', '70 см'],
        '80см': ['80 сантиметров', '80 см'],
        '90см': ['90 сантиметров', '90 см'],
        '100см': ['100 сантиметров', '100 см'],
      },

      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 3,
          twoTypos: 6,
        },
        disableOnWords: ['cm', 'см', 'арт', 'шт', 'in', 'set'],
      },

      separatorTokens: [' ', '-', '/', "'", '"', '(', ')', '[', ']'],
      nonSeparatorTokens: ['.', ',', ';', ':', '!', '?'],
    });

    console.log('✅ Meilisearch settings configured successfully');
  } catch (error) {
    loggerServer.error('Ошибка расширенной настройки Meilisearch:', error);
    throw error;
  }
}
