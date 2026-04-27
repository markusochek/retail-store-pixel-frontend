import 'dotenv/config';
import { VK } from 'vk-io';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const vk = new VK({ token: process.env.VK_TOKEN! });

const IMAGES_DIR = path.join(process.cwd(), 'public', 'uploads', 'images');
fs.mkdirSync(IMAGES_DIR, { recursive: true });

/**
 * 🔥 FIX для VK CDN
 */
const http = axios.create({
  timeout: 10000,
  httpsAgent: new https.Agent({
    keepAlive: false,
  }),
  headers: {
    'User-Agent': 'Mozilla/5.0',
    Referer: 'https://vk.com',
  },
});

/**
 * 🔥 Рандом
 */
function randomPrice(tag: string): number {
  if (tag === 'toys') return Math.floor(Math.random() * 3000 + 500);
  if (tag === 'officesupplies') return Math.floor(Math.random() * 500 + 50);
  return Math.floor(Math.random() * 1000 + 100);
}

function randomQuantity(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/**
 * 🔥 Категории
 */
function mapCategory(tag: string): number {
  return tag === 'officesupplies' ? 2 : 1;
}

/**
 * 🔥 Парсинг текста
 */
function fixUnicode(str: string): string {
  if (!str) return '';

  return str
    .replace(/[\uD800-\uDFFF]/g, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim();
}

function cleanText(text: string): string {
  return text
    .replace(/[⚡🔥❗✨💖😍🎄😈🦄💞🎉🎊👇]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isTrashLine(line: string): boolean {
  const trashPatterns: RegExp[] = [
    /^новинки?$/i,
    /^новое поступление$/i,
    /^снова в наличии$/i,
    /^в наличии$/i,
    /^хит$/i,
    /^акция$/i,
    /^🔥+$/i,
    /^❗+$/i,
    /^-+$/,
    /^👇+/,
  ];

  const cleaned = cleanText(line.toLowerCase());

  return cleaned.length < 4 || trashPatterns.some(p => p.test(cleaned));
}

function normalizeTitle(line: string): string {
  let text = cleanText(line);

  text = text
    .replace(/новинки?/gi, '')
    .replace(/снова в наличии/gi, '')
    .replace(/в наличии/gi, '')
    .replace(/хит/gi, '')
    .replace(/акция/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

function parseVKPost(text: string): { title: string; description: string; tags: string[] } {
  const lines = text.split('\n');

  const tags = text.match(/#([a-zA-Z0-9_-]+)/g)?.map(t => t.replace('#', '')) || [];

  const contentLines = lines.map(line => line.trim()).filter(line => line && !line.startsWith('#'));

  let title = 'Без названия';

  for (const line of contentLines) {
    if (!isTrashLine(line)) {
      const normalized = normalizeTitle(line);

      if (normalized.length > 3) {
        title = normalized;
        break;
      }
    }
  }

  const description = contentLines.join('\n');

  return { title, description, tags };
}

/**
 * 🔥 Скачивание с retry
 */
async function downloadImage(url: string, retries = 3): Promise<string | null> {
  try {
    const safeUrl = encodeURI(url);
    const { pathname } = new URL(safeUrl);
    const filename = path.basename(pathname);

    const filepath = path.join(IMAGES_DIR, filename);

    if (fs.existsSync(filepath)) {
      return filename;
    }

    const response = await http.get(safeUrl, {
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return filename;
  } catch (err: any) {
    if (retries > 0) {
      console.log('retry...', url);
      await new Promise(r => setTimeout(r, 1000));
      return downloadImage(url, retries - 1);
    }

    console.error('❌ Ошибка скачивания:', url, err.message);
    return null;
  }
}

/**
 * 🔥 Основной парсер
 */
async function syncVKGroupPosts(): Promise<void> {
  const owner_id = -Number(process.env.VK_GROUP_ID!);

  let offset = 0;
  const count = 100;
  let total = 0;

  do {
    const response = await vk.api.wall.get({
      owner_id,
      count,
      offset,
    });

    const posts = response.items;

    if (offset === 0) {
      total = response.count;
      console.log(`📊 Всего постов: ${total}`);
    }

    console.log(`👉 Загружаю ${offset} - ${offset + posts.length}`);

    for (const item of posts) {
      await processPost(item);
    }

    offset += count;
  } while (offset < total);

  console.log('🚀 ВСЕ посты синхронизированы');
}

async function processPost(item: any): Promise<void> {
  const { title, description, tags } = parseVKPost(item.text);

  const mainTag = tags.find(t => ['toys', 'officesupplies'].includes(t)) || 'toys';

  const category_id = mapCategory(mainTag);

  const vk_url = `https://vk.com/wall-${process.env.VK_GROUP_ID!}_${item.id}`;

  const cleanTitle = fixUnicode(title);
  const cleanDescription = fixUnicode(description);

  const product = await prisma.products.upsert({
    where: { vk_url },
    update: {
      name: cleanTitle,
      description: cleanDescription,
      vk_tags: tags.join(','),
      sale_price: randomPrice(mainTag),
      quantity: randomQuantity(),
      updated_at: new Date(),
    },
    create: {
      name: cleanTitle,
      description: cleanDescription,
      vk_tags: tags.join(','),
      vk_url,
      sale_price: randomPrice(mainTag),
      quantity: randomQuantity(),
      category_id,
    },
  });

  if (!item.attachments) return;

  for (const attach of item.attachments) {
    if (attach.type !== 'photo') continue;

    const largest = attach.photo.sizes.reduce((a: any, b: any) => (a.width > b.width ? a : b));

    const localPath = await downloadImage(largest.url);
    if (!localPath) continue;

    const exists = await prisma.images.findFirst({
      where: {
        product_id: product.id,
        path_to_image: localPath,
      },
    });

    if (!exists) {
      await prisma.images.create({
        data: {
          path_to_image: localPath,
          product_id: product.id,
        },
      });
    }
  }

  console.log('✔', cleanTitle);
}

/**
 * 🚀 Запуск
 */
syncVKGroupPosts()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
