import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { prisma } from '@/app/lib/db/prisma';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const productId = formData.get('productId') as string;

  if (!file) {
    return NextResponse.json({ error: 'No file received' }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), 'public/uploads/images');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const filePath = path.join(uploadDir, filename);

  try {
    await writeFile(filePath, buffer);

    const updateResult = await prisma.products.update({
      where: { id: Number(productId) },
      data: { path_to_image: filename },
    });
    if (updateResult != null) {
      return NextResponse.json({ url: `/uploads/images/${filename}` });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
