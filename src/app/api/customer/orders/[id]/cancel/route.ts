import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason } = await request.json();

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cancellation rule: only pending or confirmed orders can be cancelled by customers
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot cancel an order that is already in '${order.status}' status` },
        { status: 400 }
      );
    }

    // Transaction to restore inventory and update order
    await prisma.$transaction(async (tx) => {
      // Restore inventory
      for (const item of order.items) {
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
              referenceId: `CANCEL_${order.orderNumber}`,
            },
          });
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason || 'Cancelled by customer',
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'CANCELLED',
          note: `Cancelled by customer: ${reason || 'No reason provided'}`,
          changedBy: 'CUSTOMER',
        },
      });
    });

    return NextResponse.json({ message: 'Order successfully cancelled and inventory restored' });
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}
