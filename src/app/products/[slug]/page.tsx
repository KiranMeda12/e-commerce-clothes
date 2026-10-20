import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductDetailView from '@/components/product/ProductDetailView';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: params.slug }, { id: params.slug }],
      },
    });

    if (!product) return { title: 'Product Not Found | ATELIER ÉLITE' };

    return {
      title: `${product.name} | ATELIER ÉLITE`,
      description: product.description.slice(0, 160),
    };
  } catch (err) {
    return { title: 'Product | ATELIER ÉLITE' };
  }
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: params.slug }, { id: params.slug }],
      },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
        category: true,
        collection: true,
      },
    });

    if (product) {
      relatedProducts = await prisma.product.findMany({
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
          images: { orderBy: { displayOrder: 'asc' } },
          variants: true,
          category: true,
        },
      });
    }
  } catch (err) {
    console.error('Graceful degradation on product page fetch:', err);
  }

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailView product={product} relatedProducts={relatedProducts} />
  );
}
