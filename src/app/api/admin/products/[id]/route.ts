import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        variants: true,
        category: true,
        collection: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN' || error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      await tx.product.update({
        where: { id: params.id },
        data: {
          name,
          slug,
          sku,
          description,
          details,
          careGuide,
          sizeGuide,
          price: parseFloat(price),
          salePrice: salePrice ? parseFloat(salePrice) : null,
          status,
          isFeatured: Boolean(isFeatured),
          isNewArrival: Boolean(isNewArrival),
          isBestSeller: Boolean(isBestSeller),
          categoryId: categoryId || null,
          collectionId: collectionId || null,
        },
      });

      // 2. Update images if provided
      if (images && Array.isArray(images)) {
        await tx.productImage.deleteMany({
          where: { productId: params.id },
        });

        await tx.productImage.createMany({
          data: images.map((img: any, idx: number) => ({
            productId: params.id,
            url: typeof img === 'string' ? img : img.url,
            altText: typeof img === 'object' ? img.altText : name,
            displayOrder: idx + 1,
            isPrimary: idx === 0,
          })),
        });
      }

      // 3. Update or recreate variants if provided
      if (variants && Array.isArray(variants)) {
        for (const v of variants) {
          if (v.id) {
            // Update existing variant
            const oldVariant = existingProduct.variants.find((ov) => ov.id === v.id);
            const newStock = parseInt(v.stock, 10);
            const stockDiff = newStock - (oldVariant ? oldVariant.stock : 0);

            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                size: v.size,
                color: v.color,
                colorHex: v.colorHex || '#000000',
                sku: v.sku,
                stock: newStock,
                priceAdjustment: v.priceAdjustment ? parseFloat(v.priceAdjustment) : 0,
              },
            });

            if (stockDiff !== 0) {
              await tx.stockMovement.create({
                data: {
                  variantId: v.id,
                  changeAmount: stockDiff,
                  reason: stockDiff > 0 ? 'RESTOCK' : 'MANUAL_ADJUSTMENT',
                  referenceId: 'ADMIN_UPDATE',
                },
              });
            }
          } else {
            // New variant
            const variantSku = v.sku || `${sku}-${v.size}-${v.color}`.replace(/\s+/g, '-').toUpperCase();
            const created = await tx.productVariant.create({
              data: {
                productId: params.id,
                size: v.size,
                color: v.color,
                colorHex: v.colorHex || '#000000',
                sku: variantSku,
                stock: parseInt(v.stock, 10),
                priceAdjustment: v.priceAdjustment ? parseFloat(v.priceAdjustment) : 0,
              },
            });

            if (parseInt(v.stock, 10) > 0) {
              await tx.stockMovement.create({
                data: {
                  variantId: created.id,
                  changeAmount: parseInt(v.stock, 10),
                  reason: 'RESTOCK',
                  referenceId: 'ADMIN_NEW_VARIANT',
                },
              });
            }
          }
        }
      }
    });

    const updated = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN' || error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Check if product is in any orders
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: params.id },
    });

    if (orderItemsCount > 0) {
      // Archive instead of hard delete to preserve historical order records
      await prisma.product.update({
        where: { id: params.id },
        data: { status: 'ARCHIVED' },
      });
      return NextResponse.json({
        message: 'Product archived successfully to preserve order history',
      });
    }

    // Hard delete if safe
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Product deleted permanently',
    });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN' || error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
