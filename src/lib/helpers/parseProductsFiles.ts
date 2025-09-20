import fs from 'node:fs';
import loggerServer from '@/lib/logger/logger-server';

export const parseProductsFile = (filename: fs.PathOrFileDescriptor) => {
  try {
    const content = fs.readFileSync(filename, 'utf8');

    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');

    if (lines.length < 2) {
      throw new Error('Файл не содержит данных или заголовков');
    }

    const headers = lines[0].split(/\t|\s{2,}/).filter((part: string) => part !== '');
    const products = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(/\t|\s{2,}/).filter((part: string) => part !== '');

      if (parts.length !== headers.length) {
        loggerServer.warn(`Строка ${i} имеет неверное количество колонок:`, parts);
        continue;
      }

      try {
        products.push({
          id: +parts[0],
          name: parts[1],
          unit_of_measurement: parts[2],
          sale_price: parseFloat(parts[3].replace(/\s/g, '').replace(',', '.')),
          quantity: parseFloat(parts[4].replace(',', '.')),
        });
      } catch (error) {
        loggerServer.warn(`Ошибка обработки строки ${i}:`, error);
      }
    }

    return products;
  } catch (error) {
    loggerServer.error('Ошибка парсинга файла:', error);
    return [];
  }
};
