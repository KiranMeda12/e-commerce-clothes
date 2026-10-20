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

    if (!reason) {
      return NextResponse.json({ error: 'Please provide a reason for the return' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'Returns can only be requested for orders that have been delivered' },
        { status: 400 }
      );
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        userId: session.id,
        reason,
        status: 'PENDING',
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: order.status,
        note: `Customer initiated a return request: "${reason}"`,
        changedBy: 'CUSTOMER',
      },
    });

    return NextResponse.json({
      message: 'Return request submitted successfully. Our concierge team will review it shortly.',
      returnRequest,
    });
  } catch (error) {
    console.error('Return request error:', error);
    return NextResponse.json({ error: 'Failed to submit return request' }, { status: 500 });
  }
}
