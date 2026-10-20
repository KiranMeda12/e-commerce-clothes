import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/utils';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    const body = await request.json();

    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      deliveryNotes,
      paymentMethod, // 'COD' | 'RAZORPAY'
      couponCode,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
      return NextResponse.json(
        { error: 'Customer name, email, phone, and delivery address are required' },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();

    // Use a transaction for stock validation, atomic deduction, and order creation
    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsToCreate: any[] = [];
      const stockMovementList: any[] = [];

      // 1. Validate each variant stock and prepare items
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            product: {
              include: {
                images: { orderBy: { displayOrder: 'asc' }, take: 1 },
              },
            },
          },
        });

        if (!variant) {
          throw new Error(`Variant not found for item`);
        }

        if (variant.product.status !== 'PUBLISHED') {
          throw new Error(`Product "${variant.product.name}" is currently unavailable`);
        }

        const quantity = Math.max(1, parseInt(item.quantity, 10));

        // Strict inventory safeguard: prevent overselling
        if (variant.stock < quantity) {
          throw new Error(
            `Insufficient stock for "${variant.product.name}" (${variant.size} / ${variant.color}). Only ${variant.stock} left in stock.`
          );
        }

        // Decrement stock
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: quantity } },
        });

        stockMovementList.push({
          variantId: variant.id,
          changeAmount: -quantity,
          reason: 'ORDER_FULFILLMENT',
          referenceId: orderNumber,
        });

        const unitPrice = (variant.product.salePrice ?? variant.product.price) + variant.priceAdjustment;
        const itemTotal = unitPrice * quantity;
        subtotal += itemTotal;

        orderItemsToCreate.push({
          productId: variant.product.id,
          variantId: variant.id,
          productName: variant.product.name,
          productImage: variant.product.images[0]?.url || '',
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          unitPrice,
          quantity,
          totalPrice: itemTotal,
        });
      }

      // 2. Shipping calculation
      const freeShippingSetting = await tx.storeSetting.findUnique({
        where: { key: 'free_shipping_threshold' },
      });
      const shippingRateSetting = await tx.storeSetting.findUnique({
        where: { key: 'standard_shipping_rate' },
      });

      const freeThreshold = freeShippingSetting ? parseFloat(freeShippingSetting.value) : 2999;
      const standardRate = shippingRateSetting ? parseFloat(shippingRateSetting.value) : 199;
      const shippingFee = subtotal >= freeThreshold ? 0 : standardRate;

      // 3. Discount calculation if coupon applied
      let discount = 0;
      let appliedCoupon: any = null;

      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.toUpperCase().trim() },
        });

        if (coupon && coupon.isActive) {
          const now = new Date();
          const isDateValid = (!coupon.startDate || new Date(coupon.startDate) <= now) &&
                              (!coupon.endDate || new Date(coupon.endDate) >= now);
          const isUsageValid = !coupon.maxUses || coupon.currentUses < coupon.maxUses;
          const isMinSpendValid = subtotal >= coupon.minOrderAmount;

          if (isDateValid && isUsageValid && isMinSpendValid) {
            appliedCoupon = coupon;
            if (coupon.discountType === 'PERCENTAGE') {
              discount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
              }
            } else {
              discount = coupon.discountValue;
            }
            discount = Math.min(discount, subtotal);

            // Increment usage count
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { currentUses: { increment: 1 } },
            });
          }
        }
      }

      const total = Math.max(0, subtotal - discount + shippingFee);

      // 4. Create the Order
      const isCod = paymentMethod === 'COD';
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.id || null,
          customerName,
          customerEmail,
          customerPhone,
          subtotal,
          discount,
          shippingFee,
          tax: 0,
          total,
          currency: 'INR',
          status: isCod ? 'CONFIRMED' : 'PENDING',
          paymentMethod: isCod ? 'COD' : 'RAZORPAY',
          paymentStatus: isCod ? 'PENDING' : 'PENDING',
          shippingAddress: JSON.stringify(shippingAddress),
          deliveryNotes: deliveryNotes || null,
          items: {
            create: orderItemsToCreate,
          },
          statusHistory: {
            create: [
              {
                status: isCod ? 'CONFIRMED' : 'PENDING',
                note: isCod
                  ? 'Order confirmed via Cash on Delivery'
                  : 'Order created, awaiting payment verification',
                changedBy: session ? 'CUSTOMER' : 'SYSTEM',
              },
            ],
          },
        },
      });

      // Record coupon usage
      if (appliedCoupon) {
        await tx.couponUsage.create({
          data: {
            couponId: appliedCoupon.id,
            orderId: order.id,
            userId: session?.id || null,
            discountApplied: discount,
          },
        });
      }

      // Record stock movements
      for (const sm of stockMovementList) {
        await tx.stockMovement.create({
          data: sm,
        });
      }

      return order;
    });

    // If online payment (Razorpay), create Razorpay order
    if (paymentMethod === 'RAZORPAY') {
      const razorpayOrder = await createRazorpayOrder({
        amount: result.total,
        orderNumber: result.orderNumber,
        currency: 'INR',
        notes: {
          orderId: result.id,
          customerEmail,
        },
      });

      // Attach payment transaction
      await prisma.paymentTransaction.create({
        data: {
          orderId: result.id,
          provider: 'RAZORPAY',
          gatewayOrderId: razorpayOrder.id,
          amount: result.total,
          currency: 'INR',
          status: 'INITIATED',
          metadata: JSON.stringify(razorpayOrder),
        },
      });

      return NextResponse.json({
        success: true,
        order: result,
        razorpayOrder,
        requiresPayment: true,
      });
    }

    // Cash on Delivery
    return NextResponse.json({
      success: true,
      order: result,
      requiresPayment: false,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to place order' },
      { status: 400 }
    );
  }
}
