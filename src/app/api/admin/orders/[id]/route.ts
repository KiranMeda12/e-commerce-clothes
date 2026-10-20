import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        paymentTransactions: { orderBy: { createdAt: 'desc' } },
        couponUsages: { include: { coupon: true } },
        returnRequests: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN' || error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}
