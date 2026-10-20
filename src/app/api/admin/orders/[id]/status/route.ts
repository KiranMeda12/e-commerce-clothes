import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const {
      status,
      paymentStatus,
      courierName,
      trackingNumber,
      internalNotes,
      statusNote,
    } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isTransitioningToCancelled = status === 'CANCELLED' && existingOrder.status !== 'CANCELLED';

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // If newly cancelled, restore stock
      if (isTransitioningToCancelled) {
        for (const item of existingOrder.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });

            await tx.stockMovement.create({
              data: {
                variantId: item.variantId,
                changeAmount: item.quantity,
                reason: 'RETURN',
                referenceId: `ADMIN_CANCEL_${existingOrder.orderNumber}`,
              },
            });
          }
        }
      }

      const order = await tx.order.update({
        where: { id: params.id },
        data: {
          ...(status ? { status } : {}),
          ...(paymentStatus ? { paymentStatus } : {}),
          ...(courierName !== undefined ? { courierName } : {}),
          ...(trackingNumber !== undefined ? { trackingNumber } : {}),
          ...(internalNotes !== undefined ? { internalNotes } : {}),
        },
      });

      // Record in status audit history
      if (status && status !== existingOrder.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status,
            note: statusNote || `Status updated to ${status} by Store Director (${admin.name})`,
            changedBy: 'OWNER',
          },
        });
      }

      return order;
    });

    return NextResponse.json({
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN' || error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
