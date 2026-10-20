import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variants: {
          orderBy: [{ color: 'asc' }, { size: 'asc' }],
        },
        category: true,
        collection: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch related products from same category or collection
    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        status: 'PUBLISHED',
        OR: [
          { categoryId: product.categoryId },
          { collectionId: product.collectionId },
        ],
      },
      take: 4,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({ product, relatedProducts });
  } catch (error) {
    console.error('Product detail fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product details' },
      { status: 500 }
    );
  }
}
