import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: any = { role: 'CUSTOMER' };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        addresses: {
          select: {
            city: true,
            state: true,
            streetAddress: true,
            postalCode: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    const transformed = customers.map((c) => {
      const validOrders = c.orders.filter((o) => o.status !== 'CANCELLED');
      const totalSpend = validOrders.reduce((sum, o) => sum + o.total, 0);
      const lastOrder = c.orders[0]?.createdAt || null;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        joinedDate: c.createdAt,
        totalOrders: c.orders.length,
        totalSpend,
        lastOrderDate: lastOrder,
        addressesCount: c.addresses.length,
        primaryCity: c.addresses[0]?.city || 'N/A',
      };
    });

    return NextResponse.json({ customers: transformed });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN' || error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Admin customers error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
