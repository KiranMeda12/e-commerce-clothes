const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning up existing database records ---');
  await prisma.orderStatusHistory.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.customerAddress.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.storeSetting.deleteMany();
  await prisma.storeBanner.deleteMany();

  console.log('--- Creating Users ---');
  const adminPassword = await bcrypt.hash('admin123456', 12);
  const customerPassword = await bcrypt.hash('customer123456', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@atelier.com',
      passwordHash: adminPassword,
      name: 'Alexander Cross',
      role: 'ADMIN',
      phone: '+91 98765 43210',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      passwordHash: customerPassword,
      name: 'Eleanor Vance',
      role: 'CUSTOMER',
      phone: '+91 98200 12345',
      addresses: {
        create: [
          {
            fullName: 'Eleanor Vance',
            phone: '+91 98200 12345',
            streetAddress: '42 Palm Boulevard',
            apartment: 'Penthouse 7B, Horizon Towers',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400050',
            country: 'India',
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log('--- Creating Categories ---');
  const catWomen = await prisma.category.create({
    data: {
      name: 'Women',
      slug: 'women',
      description: 'Sculptural silhouettes, fluid silks, and refined tailoring for women.',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    },
  });

  const catMen = await prisma.category.create({
    data: {
      name: 'Men',
      slug: 'men',
      description: 'Understated menswear crafted with fine Italian wools and architectural cuts.',
      imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop',
    },
  });

  const catAccessories = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Artisanal leather goods, mulberry silk scarves, and minimalist accents.',
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop',
    },
  });

  const catOuterwear = await prisma.category.create({
    data: {
      name: 'Outerwear',
      slug: 'outerwear',
      description: 'Double-faced cashmere coats, trench coats, and tailored wool blazers.',
      imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop',
    },
  });

  console.log('--- Creating Collections ---');
  const colMinimalist = await prisma.collection.create({
    data: {
      name: 'Atelier Minimalist 2026',
      slug: 'atelier-minimalist-2026',
      description: 'Monochromatic lines, architectural drapery, and pure natural fabrics.',
      bannerImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop',
      isFeatured: true,
      displayOrder: 1,
    },
  });

  const colSummerLinen = await prisma.collection.create({
    data: {
      name: 'Summer Linen Capsule',
      slug: 'summer-linen-capsule',
      description: 'Airy textures, washed sand hues, and relaxed coastal tailoring.',
      bannerImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop',
      isFeatured: true,
      displayOrder: 2,
    },
  });

  const colTailored = await prisma.collection.create({
    data: {
      name: 'Tailored Silhouettes',
      slug: 'tailored-silhouettes',
      description: 'Precision blazers and wide-leg trousers cut from heritage virgin wool.',
      bannerImage: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1600&auto=format&fit=crop',
      isFeatured: true,
      displayOrder: 3,
    },
  });

  console.log('--- Creating Products & Variants ---');
  const productsData = [
    {
      name: 'Double-Faced Cashmere Overcoat',
      slug: 'double-faced-cashmere-overcoat',
      sku: 'ATL-COAT-001',
      description: 'An enduring staple handcrafted from 100% Mongolian cashmere. Featuring an unlined double-faced construction with hand-finished interior seams, horn buttons, and an oversized silhouette that drapes effortlessly over tailoring or knitwear.',
      details: 'Hand-stitched lapels\nConcealed horn button closure\nTwo deep welt front pockets\nRelaxed fluid fit\nDry clean only',
      careGuide: 'Professional dry clean only. Store on a contoured wooden hanger. Steam lightly between wears.',
      sizeGuide: 'Model is 5\'10" wearing size S. Cut for an intentional relaxed silhouette. Order your normal size or size down for a closer fit.',
      price: 14500,
      salePrice: 12900,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      categoryId: catOuterwear.id,
      collectionId: colMinimalist.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000&auto=format&fit=crop', isPrimary: false, displayOrder: 3 },
      ],
      variants: [
        { size: 'S', color: 'Camel', colorHex: '#C19A6B', stock: 12, sku: 'ATL-COAT-001-S-CAM' },
        { size: 'M', color: 'Camel', colorHex: '#C19A6B', stock: 15, sku: 'ATL-COAT-001-M-CAM' },
        { size: 'L', color: 'Camel', colorHex: '#C19A6B', stock: 8, sku: 'ATL-COAT-001-L-CAM' },
        { size: 'S', color: 'Noir Black', colorHex: '#121212', stock: 10, sku: 'ATL-COAT-001-S-BLK' },
        { size: 'M', color: 'Noir Black', colorHex: '#121212', stock: 14, sku: 'ATL-COAT-001-M-BLK' },
      ],
    },
    {
      name: 'Relaxed Silk Charmeuse Bias Dress',
      slug: 'relaxed-silk-charmeuse-bias-dress',
      sku: 'ATL-DRS-002',
      description: 'Cut on the bias from high-density 22mm silk charmeuse, this slip dress skims the contour of the body with a liquid luster. Finished with delicate rouleau straps and an ankle-grazing hem.',
      details: '100% Mulberry Silk Charmeuse\nFrench interior seams\nAdjustable skinny straps\nLow scooped back\nBias cut for fluid drape',
      careGuide: 'Dry clean or delicate hand wash cold in pH-neutral silk detergent. Lay flat in shade.',
      sizeGuide: 'Fits true to size. Designed to drape softly over hips.',
      price: 9200,
      salePrice: null,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      categoryId: catWomen.id,
      collectionId: colMinimalist.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1000&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop', isPrimary: false, displayOrder: 2 },
      ],
      variants: [
        { size: 'XS', color: 'Champagne Ivory', colorHex: '#F7F5EB', stock: 6, sku: 'ATL-DRS-002-XS-IVR' },
        { size: 'S', color: 'Champagne Ivory', colorHex: '#F7F5EB', stock: 9, sku: 'ATL-DRS-002-S-IVR' },
        { size: 'M', color: 'Champagne Ivory', colorHex: '#F7F5EB', stock: 11, sku: 'ATL-DRS-002-M-IVR' },
        { size: 'S', color: 'Slate Charcoal', colorHex: '#2B2B2B', stock: 7, sku: 'ATL-DRS-002-S-CHR' },
        { size: 'M', color: 'Slate Charcoal', colorHex: '#2B2B2B', stock: 8, sku: 'ATL-DRS-002-M-CHR' },
      ],
    },
    {
      name: 'Tailored Wide-Leg Pleated Trousers',
      slug: 'tailored-wide-leg-pleated-trousers',
      sku: 'ATL-TRS-003',
      description: 'Impeccably tailored trousers with twin forward pleats and an architectural wide leg. Woven from lightweight virgin wool with a touch of stretch for fluid comfort.',
      details: 'Concealed zip fly and tab closure\nTwin deep reverse front pleats\nHigh-rise waistband with side tab adjusters\nPressed sharp front creases',
      careGuide: 'Dry clean only. Steam vertically.',
      sizeGuide: 'High-waisted fit with generous leg volume. If between sizes, size down.',
      price: 6800,
      salePrice: 5900,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      categoryId: catWomen.id,
      collectionId: colTailored.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1000&auto=format&fit=crop', isPrimary: false, displayOrder: 2 },
      ],
      variants: [
        { size: 'S', color: 'Oatmeal Beige', colorHex: '#D7CEBE', stock: 14, sku: 'ATL-TRS-003-S-OAT' },
        { size: 'M', color: 'Oatmeal Beige', colorHex: '#D7CEBE', stock: 18, sku: 'ATL-TRS-003-M-OAT' },
        { size: 'L', color: 'Oatmeal Beige', colorHex: '#D7CEBE', stock: 10, sku: 'ATL-TRS-003-L-OAT' },
        { size: 'S', color: 'Obsidian Black', colorHex: '#181818', stock: 12, sku: 'ATL-TRS-003-S-OBS' },
        { size: 'M', color: 'Obsidian Black', colorHex: '#181818', stock: 15, sku: 'ATL-TRS-003-M-OBS' },
      ],
    },
    {
      name: 'Oversized Italian Linen Resort Shirt',
      slug: 'oversized-italian-linen-resort-shirt',
      sku: 'ATL-SHT-004',
      description: 'Spun from airy European flax with a soft garment-washed finish. Designed with a camp collar, mother-of-pearl buttons, and a clean boxy hem suited for warm climates.',
      details: '100% Pure European Linen\nCamp collar / Cuban collar\nGenuine mother-of-pearl buttons\nBreathable relaxed fit',
      careGuide: 'Machine wash gentle cold or hand wash. Hang dry. Embrace natural linen creases.',
      sizeGuide: 'Relaxed camp-collar cut. Take your standard size for an effortless drape.',
      price: 4900,
      salePrice: null,
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      categoryId: catMen.id,
      collectionId: colSummerLinen.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop', isPrimary: false, displayOrder: 2 },
      ],
      variants: [
        { size: 'M', color: 'Sand White', colorHex: '#F2EFE9', stock: 20, sku: 'ATL-SHT-004-M-SND' },
        { size: 'L', color: 'Sand White', colorHex: '#F2EFE9', stock: 16, sku: 'ATL-SHT-004-L-SND' },
        { size: 'XL', color: 'Sand White', colorHex: '#F2EFE9', stock: 8, sku: 'ATL-SHT-004-XL-SND' },
        { size: 'M', color: 'Sage Green', colorHex: '#8A9A86', stock: 12, sku: 'ATL-SHT-004-M-SGE' },
        { size: 'L', color: 'Sage Green', colorHex: '#8A9A86', stock: 10, sku: 'ATL-SHT-004-L-SGE' },
      ],
    },
    {
      name: 'Structured Double-Breasted Wool Blazer',
      slug: 'structured-double-breasted-wool-blazer',
      sku: 'ATL-BLZ-005',
      description: 'A sharp, structural blazer tailored with broad peaked lapels and canvassed shoulders. Cut in rich midnight navy wool crepe for year-round elegance.',
      details: 'Half-canvas construction\nSix-button double-breasted stance\nDouble back vent\nCupro interior lining\nFunctional surgeon cuffs',
      careGuide: 'Dry clean only by garment care specialists.',
      sizeGuide: 'Tailored fit with structured shoulder pads. Order your true suit size.',
      price: 13500,
      salePrice: 11900,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      categoryId: catMen.id,
      collectionId: colTailored.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop', isPrimary: false, displayOrder: 2 },
      ],
      variants: [
        { size: 'S', color: 'Midnight Navy', colorHex: '#1B263B', stock: 5, sku: 'ATL-BLZ-005-S-NVY' },
        { size: 'M', color: 'Midnight Navy', colorHex: '#1B263B', stock: 9, sku: 'ATL-BLZ-005-M-NVY' },
        { size: 'L', color: 'Midnight Navy', colorHex: '#1B263B', stock: 7, sku: 'ATL-BLZ-005-L-NVY' },
        { size: 'XL', color: 'Midnight Navy', colorHex: '#1B263B', stock: 4, sku: 'ATL-BLZ-005-XL-NVY' },
      ],
    },
    {
      name: 'Artisanal Minimalist Leather Tote',
      slug: 'artisanal-minimalist-leather-tote',
      sku: 'ATL-ACC-006',
      description: 'Hand-burnished Italian calfskin leather tote bag with clean geometry. Features an unlined suede interior, an interior zipped phone pouch, and seamless reinforced shoulder handles.',
      details: 'Full-grain vegetable-tanned leather\nRaw edges hand-painted with beeswax\nMagnetic top closure\nInterior removable zipped organizer pouch',
      careGuide: 'Condition with organic leather cream twice a year. Keep away from prolonged direct moisture.',
      sizeGuide: 'Dimensions: 38cm width x 32cm height x 14cm depth. Fits 15" laptop comfortably.',
      price: 8500,
      salePrice: null,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      categoryId: catAccessories.id,
      collectionId: colMinimalist.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop', isPrimary: false, displayOrder: 2 },
      ],
      variants: [
        { size: 'One Size', color: 'Espresso Cognac', colorHex: '#4A2C11', stock: 15, sku: 'ATL-ACC-006-OS-COG' },
        { size: 'One Size', color: 'Noir Pitch', colorHex: '#111111', stock: 12, sku: 'ATL-ACC-006-OS-PCH' },
      ],
    },
    {
      name: 'Fine Gauge Merino Turtleneck',
      slug: 'fine-gauge-merino-turtleneck',
      sku: 'ATL-KNT-007',
      description: 'Spun from ultra-fine 19.5 micron Australian Merino wool in an 18-gauge jersey knit. Soft as a second skin with thermoregulating breathability.',
      details: '100% Extra-Fine Merino Wool\nSeamless ribbed neckband\nSlim, flattering silhouette\nNaturally odor-resistant',
      careGuide: 'Hand wash cold using wool shampoo. Lay flat to dry.',
      sizeGuide: 'Tailored slim fit. If you prefer a relaxed silhouette, size up.',
      price: 5200,
      salePrice: 4600,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      categoryId: catWomen.id,
      collectionId: colMinimalist.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
      ],
      variants: [
        { size: 'XS', color: 'Alabaster White', colorHex: '#F6F6F4', stock: 8, sku: 'ATL-KNT-007-XS-ALB' },
        { size: 'S', color: 'Alabaster White', colorHex: '#F6F6F4', stock: 14, sku: 'ATL-KNT-007-S-ALB' },
        { size: 'M', color: 'Alabaster White', colorHex: '#F6F6F4', stock: 12, sku: 'ATL-KNT-007-M-ALB' },
        { size: 'S', color: 'Deep Olive', colorHex: '#3D4532', stock: 6, sku: 'ATL-KNT-007-S-OLV' },
        { size: 'M', color: 'Deep Olive', colorHex: '#3D4532', stock: 9, sku: 'ATL-KNT-007-M-OLV' },
      ],
    },
    {
      name: 'Relaxed Pleated Linen Chino Shorts',
      slug: 'relaxed-pleated-linen-chino-shorts',
      sku: 'ATL-SHT-008',
      description: 'Tailored summer shorts cut with a generous 7-inch inseam, double pleats, and an elasticated back waistband for refined warm-weather ease.',
      details: '100% Washed Linen\nFront double pleats\nElasticated back waistband with drawcord\nTwo slash pockets and two rear welt pockets',
      careGuide: 'Machine wash cold on gentle cycle. Hang dry.',
      sizeGuide: 'Relaxed fit sitting comfortably at natural waist.',
      price: 3800,
      salePrice: null,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      categoryId: catMen.id,
      collectionId: colSummerLinen.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=1000&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
      ],
      variants: [
        { size: 'S', color: 'Sand Beige', colorHex: '#D8CBBD', stock: 15, sku: 'ATL-SHT-008-S-SND' },
        { size: 'M', color: 'Sand Beige', colorHex: '#D8CBBD', stock: 18, sku: 'ATL-SHT-008-M-SND' },
        { size: 'L', color: 'Sand Beige', colorHex: '#D8CBBD', stock: 12, sku: 'ATL-SHT-008-L-SND' },
      ],
    },
  ];

  for (const p of productsData) {
    const { images, variants, ...prodFields } = p;
    const createdProduct = await prisma.product.create({
      data: {
        ...prodFields,
        images: {
          create: images,
        },
        variants: {
          create: variants,
        },
      },
      include: {
        variants: true,
      },
    });

    // Create initial stock movements for audit
    for (const v of createdProduct.variants) {
      await prisma.stockMovement.create({
        data: {
          variantId: v.id,
          changeAmount: v.stock,
          reason: 'RESTOCK',
          referenceId: 'INITIAL_STORE_OPENING',
        },
      });
    }
  }

  console.log('--- Creating Promotional Coupons ---');
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      description: '10% discount on your first order with no minimum limit',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 0,
      maxDiscount: 2000,
      maxUses: 500,
      currentUses: 4,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'ATELIER20',
      description: '20% off on luxury purchases above ₹5,000',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderAmount: 5000,
      maxDiscount: 3000,
      maxUses: 100,
      currentUses: 12,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'LUXURY500',
      description: '₹500 flat savings on orders above ₹3,000',
      discountType: 'FIXED',
      discountValue: 500,
      minOrderAmount: 3000,
      maxUses: 200,
      currentUses: 18,
      isActive: true,
    },
  });

  console.log('--- Creating Store Settings & Banners ---');
  await prisma.storeSetting.createMany({
    data: [
      { key: 'store_name', value: 'ATELIER ÉLITE', description: 'Public boutique name' },
      { key: 'store_tagline', value: 'High Craftsmanship & Minimalist Luxury', description: 'Store motto' },
      { key: 'support_email', value: 'concierge@atelier-elite.com', description: 'Customer care email' },
      { key: 'support_phone', value: '+91 (0) 22 4987 6500', description: 'Customer service desk' },
      { key: 'currency', value: 'INR', description: 'Store base currency' },
      { key: 'free_shipping_threshold', value: '2999', description: 'Threshold for complimentary courier' },
      { key: 'standard_shipping_rate', value: '199', description: 'Standard ground delivery fee' },
      { key: 'announcement_bar', value: 'COMPLIMENTARY WHITE-GLOVE DELIVERY ON ALL ORDERS ABOVE ₹2,999', description: 'Top banner notice' },
    ],
  });

  await prisma.storeBanner.create({
    data: {
      title: 'Monochrome Atelier Collection',
      subtitle: 'Winter & Spring Transition 2026',
      link: '/shop?collection=atelier-minimalist-2026',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
      buttonText: 'Discover The Edit',
      isActive: true,
      displayOrder: 1,
    },
  });

  console.log('--- Creating Initial Orders For Dashboard Analytics ---');
  const allVariants = await prisma.productVariant.findMany({
    include: { product: true },
  });

  const coatVariant = allVariants.find((v) => v.product.sku === 'ATL-COAT-001');
  const dressVariant = allVariants.find((v) => v.product.sku === 'ATL-DRS-002');
  const trousersVariant = allVariants.find((v) => v.product.sku === 'ATL-TRS-003');
  const shirtVariant = allVariants.find((v) => v.product.sku === 'ATL-SHT-004');

  // Order 1: Delivered
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ATL-20261015-1082',
      userId: customer.id,
      customerName: 'Eleanor Vance',
      customerEmail: 'customer@example.com',
      customerPhone: '+91 98200 12345',
      subtotal: 12900,
      discount: 1290,
      shippingFee: 0,
      tax: 0,
      total: 11610,
      currency: 'INR',
      status: 'DELIVERED',
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PAID',
      courierName: 'Blue Dart Luxury Logistics',
      trackingNumber: 'BDL-8829104819',
      shippingAddress: JSON.stringify({
        fullName: 'Eleanor Vance',
        phone: '+91 98200 12345',
        streetAddress: '42 Palm Boulevard',
        apartment: 'Penthouse 7B',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India',
      }),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: coatVariant.productId,
            variantId: coatVariant.id,
            productName: coatVariant.product.name,
            productImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop',
            sku: coatVariant.sku,
            size: coatVariant.size,
            color: coatVariant.color,
            unitPrice: 12900,
            quantity: 1,
            totalPrice: 12900,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Order placed by customer via Razorpay', changedBy: 'CUSTOMER' },
          { status: 'CONFIRMED', note: 'Payment verified successfully', changedBy: 'SYSTEM' },
          { status: 'PROCESSING', note: 'Item packaged in signature black box', changedBy: 'OWNER' },
          { status: 'SHIPPED', note: 'Dispatched via Blue Dart', changedBy: 'OWNER' },
          { status: 'DELIVERED', note: 'Signed and delivered to concierge', changedBy: 'SYSTEM' },
        ],
      },
      paymentTransactions: {
        create: [
          {
            provider: 'RAZORPAY',
            transactionId: 'pay_NzK832194819',
            gatewayOrderId: 'order_Nx1928374',
            amount: 11610,
            currency: 'INR',
            status: 'SUCCESS',
          },
        ],
      },
    },
  });

  // Order 2: Shipped & On Route
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ATL-20261018-2041',
      userId: customer.id,
      customerName: 'Eleanor Vance',
      customerEmail: 'customer@example.com',
      customerPhone: '+91 98200 12345',
      subtotal: 9200,
      discount: 0,
      shippingFee: 0,
      tax: 0,
      total: 9200,
      currency: 'INR',
      status: 'SHIPPED',
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PAID',
      courierName: 'Delhivery Express',
      trackingNumber: 'DLV-993810294',
      shippingAddress: JSON.stringify({
        fullName: 'Eleanor Vance',
        phone: '+91 98200 12345',
        streetAddress: '42 Palm Boulevard',
        apartment: 'Penthouse 7B',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India',
      }),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: dressVariant.productId,
            variantId: dressVariant.id,
            productName: dressVariant.product.name,
            productImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1000&auto=format&fit=crop',
            sku: dressVariant.sku,
            size: dressVariant.size,
            color: dressVariant.color,
            unitPrice: 9200,
            quantity: 1,
            totalPrice: 9200,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Order placed by customer', changedBy: 'CUSTOMER' },
          { status: 'CONFIRMED', note: 'Payment verified', changedBy: 'SYSTEM' },
          { status: 'SHIPPED', note: 'Dispatched from flagship warehouse', changedBy: 'OWNER' },
        ],
      },
      paymentTransactions: {
        create: [
          {
            provider: 'RAZORPAY',
            transactionId: 'pay_Kld8129038',
            gatewayOrderId: 'order_Lm918273',
            amount: 9200,
            currency: 'INR',
            status: 'SUCCESS',
          },
        ],
      },
    },
  });

  // Order 3: Processing
  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'ATL-20261019-3891',
      guestEmail: 'guest.shopper@gmail.com',
      guestPhone: '+91 98111 22334',
      customerName: 'Kavita Menon',
      customerEmail: 'guest.shopper@gmail.com',
      customerPhone: '+91 98111 22334',
      subtotal: 10800,
      discount: 500,
      shippingFee: 0,
      tax: 0,
      total: 10300,
      currency: 'INR',
      status: 'PROCESSING',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      shippingAddress: JSON.stringify({
        fullName: 'Kavita Menon',
        phone: '+91 98111 22334',
        streetAddress: '15 Kasturba Gandhi Marg',
        apartment: 'Suite 301',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110001',
        country: 'India',
      }),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: trousersVariant.productId,
            variantId: trousersVariant.id,
            productName: trousersVariant.product.name,
            productImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
            sku: trousersVariant.sku,
            size: trousersVariant.size,
            color: trousersVariant.color,
            unitPrice: 5900,
            quantity: 1,
            totalPrice: 5900,
          },
          {
            productId: shirtVariant.productId,
            variantId: shirtVariant.id,
            productName: shirtVariant.product.name,
            productImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
            sku: shirtVariant.sku,
            size: shirtVariant.size,
            color: shirtVariant.color,
            unitPrice: 4900,
            quantity: 1,
            totalPrice: 4900,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Order placed via Cash on Delivery', changedBy: 'CUSTOMER' },
          { status: 'CONFIRMED', note: 'Phone confirmed with customer', changedBy: 'OWNER' },
          { status: 'PROCESSING', note: 'Preparing order for shipment', changedBy: 'OWNER' },
        ],
      },
    },
  });

  console.log('✅ Seed complete!');
  console.log('----------------------------------------------------');
  console.log('Admin Account:    admin@atelier.com  /  admin123456');
  console.log('Customer Account: customer@example.com / customer123456');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
