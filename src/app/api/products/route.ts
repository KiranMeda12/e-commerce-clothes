import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const collection = searchParams.get('collection');
    const size = searchParams.get('size');
    const color = searchParams.get('color');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const status = searchParams.get('status') || 'PUBLISHED';
    const featured = searchParams.get('featured');
    const newArrival = searchParams.get('newArrival');
    const bestSeller = searchParams.get('bestSeller');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const where: any = {};

    if (status !== 'ALL') {
      where.status = status;
    }

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (collection) {
      where.collection = {
        slug: collection,
      };
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (newArrival === 'true') {
      where.isNewArrival = true;
    }

    if (bestSeller === 'true') {
      where.isBestSeller = true;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (size || color) {
      where.variants = {
        some: {
          ...(size ? { size } : {}),
          ...(color ? { color } : {}),
        },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
        { category: { name: { contains: search } } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'popular') {
      orderBy = [{ isBestSeller: 'desc' }, { createdAt: 'desc' }];
    }

    const totalCount = await prisma.product.count({ where });

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variants: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        collection: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
