import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    // 1. Orders count and aggregates
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({
      where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } },
    });
    const completedOrders = await prisma.order.count({
      where: { status: 'DELIVERED' },
    });

    // 2. Verified Total Sales (exclude CANCELLED orders)
    const validOrders = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const totalSales = validOrders.reduce((acc, curr) => acc + curr.total, 0);

    // 3. Total customers & active products
    const totalCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' },
    });

    const totalActiveProducts = await prisma.product.count({
      where: { status: 'PUBLISHED' },
    });

    // 4. Low-stock variants (stock <= 5)
    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        stock: { lte: 5 },
        product: { status: 'PUBLISHED' },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            images: { take: 1, orderBy: { displayOrder: 'asc' } },
          },
        },
      },
      take: 10,
    });

    // 5. Best-selling products (by order items count)
    const orderItemsGrouped = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const bestSellers = [];
    for (const group of orderItemsGrouped) {
      if (group.productId) {
        const prod = await prisma.product.findUnique({
          where: { id: group.productId },
          include: { images: { take: 1, orderBy: { displayOrder: 'asc' } } },
        });
        if (prod) {
          bestSellers.push({
            id: prod.id,
            name: prod.name,
            sku: prod.sku,
            price: prod.price,
            image: prod.images[0]?.url || '',
            totalSold: group._sum.quantity || 0,
            revenue: group._sum.totalPrice || 0,
          });
        }
      }
    }

    // 6. Recent orders
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        total: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        createdAt: true,
        items: {
          select: {
            productName: true,
            quantity: true,
            size: true,
            color: true,
          },
        },
      },
    });

    // 7. Sales trends for the last 7 days
    const last7Days: { date: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const startOfDay = new Date(dateKey + 'T00:00:00.000Z');
      const endOfDay = new Date(dateKey + 'T23:59:59.999Z');

      const dayOrders = validOrders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= startOfDay && orderDate <= endOfDay;
      });

      const daySales = dayOrders.reduce((sum, o) => sum + o.total, 0);

      last7Days.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: daySales,
        orders: dayOrders.length,
      });
    }

    return NextResponse.json({
      metrics: {
        totalSales,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalCustomers,
        totalActiveProducts,
        lowStockCount: lowStockVariants.length,
      },
      lowStockVariants,
      bestSellers,
      recentOrders,
      salesTrends: last7Days,
    });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN' || error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
