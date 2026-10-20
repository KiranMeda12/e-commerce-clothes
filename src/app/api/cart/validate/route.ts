import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ items: [], subtotal: 0, isValid: true });
    }

    const validatedItems = [];
    let subtotal = 0;
    let hasStockIssue = false;

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: {
            include: {
              images: { orderBy: { displayOrder: 'asc' }, take: 1 },
            },
          },
        },
      });

      if (!variant || variant.product.status !== 'PUBLISHED') {
        validatedItems.push({
          ...item,
          isValid: false,
          error: 'This item is no longer available',
        });
        hasStockIssue = true;
        continue;
      }

      const requestedQty = Math.max(1, parseInt(item.quantity, 10));
      const isAvailable = variant.stock >= requestedQty;
      const unitPrice = (variant.product.salePrice ?? variant.product.price) + variant.priceAdjustment;
      const itemTotal = unitPrice * requestedQty;

      if (!isAvailable) {
        hasStockIssue = true;
      }

      subtotal += itemTotal;

      validatedItems.push({
        variantId: variant.id,
        productId: variant.product.id,
        name: variant.product.name,
        slug: variant.product.slug,
        size: variant.size,
        color: variant.color,
        colorHex: variant.colorHex,
        image: variant.product.images[0]?.url || '',
        sku: variant.sku,
        unitPrice,
        quantity: requestedQty,
        availableStock: variant.stock,
        isAvailable,
        total: itemTotal,
      });
    }

    return NextResponse.json({
      items: validatedItems,
      subtotal,
      hasStockIssue,
      isValid: !hasStockIssue,
    });
  } catch (error) {
    console.error('Cart validation error:', error);
    return NextResponse.json({ error: 'Failed to validate cart' }, { status: 500 });
  }
}
