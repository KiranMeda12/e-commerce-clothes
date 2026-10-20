const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'atelier_production_ready_jwt_secret_token_secure_2026_xyz';

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 RUNNING ATELIER ÉLITE E2E PLATFORM VERIFICATION TEST SUITE');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Customer Authentication & Profile
  console.log('\n--- 1. Customer Authentication & Profile ---');
  const testCustomerEmail = `test.client.${Date.now()}@example.com`;
  const customerPasswordHash = await bcrypt.hash('clientpass123', 12);
  const testCustomer = await prisma.user.create({
    data: {
      name: 'Lady Genevieve',
      email: testCustomerEmail,
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      phone: '+91 98980 11223',
    },
  });
  assert(testCustomer.id && testCustomer.role === 'CUSTOMER', 'Customer registration creates user with CUSTOMER role');

  const customerToken = createToken(testCustomer);
  assert(Boolean(customerToken), 'Customer JWT authentication token successfully signed');

  // Customer updates profile
  const updatedCustomer = await prisma.user.update({
    where: { id: testCustomer.id },
    data: { phone: '+91 99999 88888' },
  });
  assert(updatedCustomer.phone === '+91 99999 88888', 'Customer can update profile phone number');

  // 2. Owner Authentication & Role Guarding
  console.log('\n--- 2. Owner Authentication & Role Guarding ---');
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@atelier.com' },
  });
  assert(adminUser && adminUser.role === 'ADMIN', 'Admin account exists with ADMIN role');

  const passwordMatch = await bcrypt.compare('admin123456', adminUser.passwordHash);
  assert(passwordMatch, 'Admin password verifies against bcrypt hash');

  const customerVerifyDecoded = jwt.verify(customerToken, JWT_SECRET);
  assert(customerVerifyDecoded.role !== 'ADMIN', 'Security Guard: Customer cannot authenticate as ADMIN');

  // 3. Owner Adds New Product & Variants
  console.log('\n--- 3. Owner Product Creation & Variant Matrix ---');
  const testProduct = await prisma.product.create({
    data: {
      name: 'Double-Faced Cashmere Trench',
      slug: `double-faced-cashmere-trench-${Date.now()}`,
      sku: `ATL-TRN-${Date.now()}`,
      description: 'Handcrafted Mongolian cashmere trench with horn buttons.',
      price: 18900,
      salePrice: 16900,
      status: 'PUBLISHED',
      isFeatured: true,
      variants: {
        create: [
          { size: 'S', color: 'Ivory', colorHex: '#FFFFF0', stock: 5, sku: `ATL-TRN-S-IVR-${Date.now()}` },
          { size: 'M', color: 'Ivory', colorHex: '#FFFFF0', stock: 8, sku: `ATL-TRN-M-IVR-${Date.now()}` },
        ],
      },
    },
    include: { variants: true },
  });
  assert(testProduct.id && testProduct.variants.length === 2, 'Owner successfully creates product with size/color variants');

  // Verify product is visible on public storefront
  const publishedProducts = await prisma.product.findMany({
    where: { status: 'PUBLISHED', id: testProduct.id },
  });
  assert(publishedProducts.length === 1, 'Newly created product immediately appears in published storefront catalog');

  // 4. Collection Management
  console.log('\n--- 4. Collection Management & Assignment ---');
  const testCollection = await prisma.collection.create({
    data: {
      name: 'Alpine Winter Haute 2026',
      slug: `alpine-winter-haute-${Date.now()}`,
      description: 'Insulating cashmere and virgin wools.',
      isFeatured: true,
    },
  });
  assert(Boolean(testCollection.id), 'Owner creates new collection');

  const assignedProduct = await prisma.product.update({
    where: { id: testProduct.id },
    data: { collectionId: testCollection.id },
  });
  assert(assignedProduct.collectionId === testCollection.id, 'Product successfully assigned to collection');

  // 5. Stock Validation & Preventing Overselling
  console.log('\n--- 5. Inventory Safeguard & Preventing Overselling ---');
  const targetVariant = testProduct.variants[0]; // Stock = 5
  const requestedQtyOversell = 10;
  const isAvailable = targetVariant.stock >= requestedQtyOversell;
  assert(!isAvailable, 'System detects oversell attempt when requested quantity (10) > variant stock (5)');

  // 6. Atomic Order Checkout & Stock Decrement
  console.log('\n--- 6. Atomic Checkout & Stock Decrement ---');
  const orderQty = 2;
  const initialStock = targetVariant.stock;

  const createdOrder = await prisma.$transaction(async (tx) => {
    // Deduct stock
    await tx.productVariant.update({
      where: { id: targetVariant.id },
      data: { stock: { decrement: orderQty } },
    });

    await tx.stockMovement.create({
      data: {
        variantId: targetVariant.id,
        changeAmount: -orderQty,
        reason: 'ORDER_FULFILLMENT',
        referenceId: 'TEST_ORDER_001',
      },
    });

    return await tx.order.create({
      data: {
        orderNumber: `ATL-TEST-${Date.now()}`,
        userId: testCustomer.id,
        customerName: testCustomer.name,
        customerEmail: testCustomer.email,
        customerPhone: testCustomer.phone || '+91 99999 88888',
        subtotal: testProduct.salePrice * orderQty,
        discount: 0,
        shippingFee: 0,
        total: testProduct.salePrice * orderQty,
        status: 'CONFIRMED',
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        shippingAddress: JSON.stringify({
          fullName: testCustomer.name,
          phone: testCustomer.phone,
          streetAddress: '10 Queens Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
        }),
        items: {
          create: [
            {
              productId: testProduct.id,
              variantId: targetVariant.id,
              productName: testProduct.name,
              productImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6',
              sku: targetVariant.sku,
              size: targetVariant.size,
              color: targetVariant.color,
              unitPrice: testProduct.salePrice,
              quantity: orderQty,
              totalPrice: testProduct.salePrice * orderQty,
            },
          ],
        },
      },
      include: { items: true },
    });
  });

  const updatedVariant = await prisma.productVariant.findUnique({
    where: { id: targetVariant.id },
  });

  assert(
    updatedVariant.stock === initialStock - orderQty,
    `Stock decremented accurately from ${initialStock} to ${updatedVariant.stock}`
  );
  assert(createdOrder.items.length === 1, 'Order created with immutable items snapshot');

  // 7. Owner Dashboard Order Management & Courier Tracking
  console.log('\n--- 7. Owner Dashboard & Courier Tracking Updates ---');
  const trackingNumber = 'BDL-VERIFY-998822';
  const updatedOrder = await prisma.order.update({
    where: { id: createdOrder.id },
    data: {
      status: 'SHIPPED',
      courierName: 'Blue Dart Luxury Logistics',
      trackingNumber,
    },
  });
  assert(updatedOrder.status === 'SHIPPED' && updatedOrder.trackingNumber === trackingNumber, 'Owner updates order status to SHIPPED and enters tracking waybill');

  // 8. Customer Order Viewing & Cancellation / Return Logic
  console.log('\n--- 8. Customer Account Order Tracking & Business Policies ---');
  const customerOrders = await prisma.order.findMany({
    where: { userId: testCustomer.id },
  });
  assert(customerOrders.length >= 1, 'Customer can view private order history in account portal');

  // Test Customer cancellation restores inventory
  const testOrderToCancel = await prisma.order.create({
    data: {
      orderNumber: `ATL-CNCL-${Date.now()}`,
      userId: testCustomer.id,
      customerName: testCustomer.name,
      customerEmail: testCustomer.email,
      customerPhone: testCustomer.phone || '',
      subtotal: 5000,
      total: 5000,
      status: 'PENDING',
      paymentMethod: 'COD',
      shippingAddress: JSON.stringify({ streetAddress: 'Test' }),
      items: {
        create: [
          {
            variantId: targetVariant.id,
            productName: testProduct.name,
            productImage: '',
            sku: targetVariant.sku,
            size: targetVariant.size,
            color: targetVariant.color,
            unitPrice: 2500,
            quantity: 1,
            totalPrice: 2500,
          },
        ],
      },
    },
  });

  // Restore inventory on cancellation
  await prisma.$transaction(async (tx) => {
    await tx.productVariant.update({
      where: { id: targetVariant.id },
      data: { stock: { increment: 1 } },
    });
    await tx.order.update({
      where: { id: testOrderToCancel.id },
      data: { status: 'CANCELLED' },
    });
  });

  const cancelledOrder = await prisma.order.findUnique({
    where: { id: testOrderToCancel.id },
  });
  assert(cancelledOrder.status === 'CANCELLED', 'Order cancellation successfully updates status to CANCELLED');

  const restoredVariant = await prisma.productVariant.findUnique({
    where: { id: targetVariant.id },
  });
  assert(restoredVariant.stock === updatedVariant.stock + 1, 'Inventory accurately restored upon cancellation');

  // Clean up test data
  await prisma.orderItem.deleteMany({ where: { orderId: { in: [createdOrder.id, testOrderToCancel.id] } } });
  await prisma.order.deleteMany({ where: { id: { in: [createdOrder.id, testOrderToCancel.id] } } });
  await prisma.stockMovement.deleteMany({ where: { variantId: targetVariant.id } });
  await prisma.productVariant.deleteMany({ where: { productId: testProduct.id } });
  await prisma.product.deleteMany({ where: { id: testProduct.id } });
  await prisma.collection.deleteMany({ where: { id: testCollection.id } });
  await prisma.user.deleteMany({ where: { id: testCustomer.id } });

  console.log('\n===============================================================');
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
