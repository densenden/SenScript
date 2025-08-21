import Stripe from 'stripe';

// Initialize Stripe
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  }
);

// Stripe configuration constants
export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  SUCCESS_URL: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  CANCEL_URL: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
};

// Product and Price IDs (from Stripe dashboard)
export const STRIPE_PRODUCTS = {
  ESSENTIAL: {
    productId: 'senscript_essential',
    priceId: process.env.STRIPE_PRICE_ESSENTIAL || 'price_essential',
    amount: 999, // €9.99 in cents
    currency: 'eur',
  },
  PREMIUM: {
    productId: 'senscript_premium', 
    priceId: process.env.STRIPE_PRICE_PREMIUM || 'price_premium',
    amount: 1799, // €17.99 in cents
    currency: 'eur',
  },
  RELOAD_15: {
    productId: 'senscript_reload15',
    priceId: process.env.STRIPE_PRICE_RELOAD15 || 'price_reload15',
    amount: 100, // €1.00 in cents
    currency: 'eur',
    type: 'one_time',
  }
};

// Create Stripe Checkout Session
export async function createCheckoutSession({
  priceId,
  successUrl,
  cancelUrl,
  customerEmail,
  metadata,
}: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: priceId.includes('reload') ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata,
      automatic_tax: {
        enabled: true,
      },
      // Enable customer portal for subscriptions
      ...(priceId.includes('reload') ? {} : {
        subscription_data: {
          description: 'SenScript subscription for AI-powered CheatCard generation',
        },
      }),
    });

    return { success: true, session };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Create Customer Portal Session
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { success: true, url: session.url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_CONFIG.WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}

// Usage tracking for metered billing
export async function createUsageRecord({
  subscriptionItemId,
  quantity,
  timestamp = Math.floor(Date.now() / 1000),
}: {
  subscriptionItemId: string;
  quantity: number;
  timestamp?: number;
}) {
  try {
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity,
        timestamp,
        action: 'increment',
      }
    );

    return { success: true, usageRecord };
  } catch (error) {
    console.error('Error creating usage record:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}