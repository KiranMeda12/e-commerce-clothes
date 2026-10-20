import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      name,
      slug,
      sku,
      description,
      details,
      careGuide,
      sizeGuide,
      price,
      salePrice,
      status,
      isFeatured,
      isNewArrival,
      isBestSeller,
      categoryId,
      collectionId,
      images,
      variants,
    } = body;

    if (!name || !price || !sku) {
      return NextResponse.json(
        { error: 'Product name, SKU, and price are required' },
        { status: 400 }
      );
    }

    const autoSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    // Check SKU or Slug conflicts
    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ sku }, { slug: autoSlug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A product with this SKU or slug already exists' },
        { status: 409 }
      );
    }

    const createdProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name,
          slug: autoSlug,
          sku,
          description: description || '',
          details: details || null,
          careGuide: careGuide || null,
          sizeGuide: sizeGuide || null,
          price: parseFloat(price),
          salePrice: salePrice ? parseFloat(salePrice) : null,
          status: status || 'PUBLISHED',
          isFeatured: Boolean(isFeatured),
          isNewArrival: Boolean(isNewArrival),
          isBestSeller: Boolean(isBestSeller),
          categoryId: categoryId || null,
          collectionId: collectionId || null,
        },
      });

      // Insert images
      if (images && Array.isArray(images) && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img: any, idx: number) => ({
            productId: product.id,
            url: typeof img === 'string' ? img : img.url,
            altText: typeof img === 'object' ? img.altText : name,
            displayOrder: idx + 1,
            isPrimary: idx === 0,
          })),
        });
      }

      // Insert variants
      if (variants && Array.isArray(variants) && variants.length > 0) {
        for (const v of variants) {
          const variantSku = v.sku || `${sku}-${v.size}-${v.color}`.replace(/\s+/g, '-').toUpperCase();
          const createdVariant = await tx.productVariant.create({
            data: {
              productId: product.id,
              size: v.size || 'One Size',
              color: v.color || 'Standard',
              colorHex: v.colorHex || '#000000',
              sku: variantSku,
              stock: parseInt(v.stock || '0', 10),
              priceAdjustment: v.priceAdjustment ? parseFloat(v.priceAdjustment) : 0,
            },
          });

          if (parseInt(v.stock || '0', 10) > 0) {
            await tx.stockMovement.create({
              data: {
                variantId: createdVariant.id,
                changeAmount: parseInt(v.stock, 10),
                reason: 'INITIAL_STOCK',
                referenceId: product.id,
              },
            });
          }
        }
      }

      return product;
    });

    return NextResponse.json({
      message: 'Product created successfully',
      product: createdProduct,
    });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN' || error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Access forbidden: Administrator role required' }, { status: 403 });
    }
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
