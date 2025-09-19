import { NextResponse } from 'next/server';
import { unlink, writeFile } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { syncProductsToMeilisearch } from '@/lib/syncProducts';
import { prisma } from '@/lib/db/prisma';
import logger from '@/lib/logger';

export async function POST(request: Request) {
  let transaction;

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const productId = formData.get('productId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files received' }, { status: 400 });
    }

    transaction = await prisma.$transaction(
      async tx => {
        const uploadDir = path.join(process.cwd(), 'public/uploads/images');
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }

        const existingImages = await tx.images.findMany({
          where: { product_id: Number(productId) },
          select: { path_to_image: true },
        });
        const existingFiles: string[] = existingImages.map(img => img.path_to_image);

        await tx.images.deleteMany({
          where: { product_id: Number(productId) },
        });

        for (const oldFilename of existingFiles) {
          const oldFilePath = path.join(uploadDir, oldFilename);
          try {
            await unlink(oldFilePath);
          } catch (error) {
            logger.warn(`Could not delete file ${oldFilename}:`, error);
          }
        }

        const newImages = [];

        for (const file of files) {
          if (!file.type.startsWith('image/')) {
            continue;
          }

          const buffer = Buffer.from(await file.arrayBuffer());
          const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.name.replace(/\s+/g, '-')}`;
          const filePath = path.join(uploadDir, filename);

          await writeFile(filePath, buffer);

          const newImage = await tx.images.create({
            data: {
              product_id: Number(productId),
              path_to_image: filename,
            },
          });

          newImages.push({
            id: newImage.toString(),
            path_to_image: newImage.path_to_image,
            productId: newImage.product_id.toString(),
          });
        }

        await syncProductsToMeilisearch();

        return {
          newImages,
        };
      },
      {
        timeout: 30000,
        maxWait: 30000,
      }
    );

    return NextResponse.json({
      message: 'Files processed successfully',
      uploadedFiles: transaction.newImages,
    });
  } catch (error) {
    logger.error('Transaction error:', error);

    return NextResponse.json(
      {
        error: 'Transaction failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
