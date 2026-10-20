import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing payment verification parameters' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      // Mark transaction as failed
      await prisma.paymentTransaction.create({
        data: {
          orderId: order.id,
          provider: 'RAZORPAY',
          transactionId: razorpayPaymentId,
          gatewayOrderId: razorpayOrderId,
          signature: razorpaySignature,
          amount: order.total,
          currency: order.currency,
          status: 'FAILED',
          metadata: JSON.stringify({ error: 'Signature verification mismatch' }),
        },
      });

      return NextResponse.json(
        { error: 'Payment signature verification failed. Untrusted transaction.' },
        { status: 400 }
      );
    }

    // Success: Update Order & Transaction
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
        },
      }),
      prisma.paymentTransaction.create({
        data: {
          orderId: order.id,
          provider: 'RAZORPAY',
          transactionId: razorpayPaymentId,
          gatewayOrderId: razorpayOrderId,
          signature: razorpaySignature,
          amount: order.total,
          currency: order.currency,
          status: 'SUCCESS',
        },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'CONFIRMED',
          note: `Payment verified successfully via Razorpay (Payment ID: ${razorpayPaymentId})`,
          changedBy: 'SYSTEM',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed',
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Server error during payment verification' },
      { status: 500 }
    );
  }
}
