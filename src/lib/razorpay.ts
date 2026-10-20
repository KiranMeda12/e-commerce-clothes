import crypto from 'crypto';

export interface CreateRazorpayOrderParams {
  amount: number; // in INR
  orderNumber: string;
  currency?: string;
  notes?: Record<string, string>;
}

export interface VerifyRazorpaySignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export function isRazorpayConfigured(): boolean {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(
    keyId &&
    keySecret &&
    !keyId.includes('your_key_id') &&
    !keySecret.includes('your_razorpay_key_secret')
  );
}

export async function createRazorpayOrder({
  amount,
  orderNumber,
  currency = 'INR',
  notes = {},
}: CreateRazorpayOrderParams) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // In test/demo mode when credentials are dummy, provide simulated Razorpay order ID
  if (!isRazorpayConfigured()) {
    return {
      id: `order_sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      amount: Math.round(amount * 100),
      currency,
      receipt: orderNumber,
      isSimulated: true,
    };
  }

  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt: orderNumber,
      notes,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Razorpay Order creation failed: ${errorText}`);
  }

  const orderData = await response.json();
  return { ...orderData, isSimulated: false };
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: VerifyRazorpaySignatureParams): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

  // If using simulated mode
  if (orderId.startsWith('order_sim_') || !isRazorpayConfigured()) {
    // Verified simulated payment
    return signature === `sig_sim_${paymentId}`;
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}
