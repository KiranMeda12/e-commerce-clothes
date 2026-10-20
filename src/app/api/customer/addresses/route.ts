import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.customerAddress.findMany({
      where: { userId: session.id },
      orderBy: { isDefault: 'desc' },
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, streetAddress, apartment, city, state, postalCode, country, isDefault } = body;

    if (!fullName || !phone || !streetAddress || !city || !state || !postalCode) {
      return NextResponse.json({ error: 'All mandatory address fields must be provided' }, { status: 400 });
    }

    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { userId: session.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.customerAddress.create({
      data: {
        userId: session.id,
        fullName,
        phone,
        streetAddress,
        apartment,
        city,
        state,
        postalCode,
        country: country || 'India',
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ message: 'Address saved', address });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save address' }, { status: 500 });
  }
}
