import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { name, slug, description, bannerImage, isFeatured, isActive, displayOrder } = await request.json();

    const collection = await prisma.collection.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        bannerImage,
        isFeatured: Boolean(isFeatured),
        isActive: Boolean(isActive),
        displayOrder: parseInt(displayOrder || '0', 10),
      },
    });

    return NextResponse.json({ message: 'Collection updated', collection });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN' || error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Preserve products by setting collectionId to null first
    await prisma.product.updateMany({
      where: { collectionId: params.id },
      data: { collectionId: null },
    });

    await prisma.collection.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Collection deleted safely without deleting products' });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN' || error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}
