import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createSubscription, updateUser } from '@/lib/db/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
      console.error('Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`Processing Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription) {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
            { expand: ['items.data.price'] }
          );
          
          await handleSubscriptionCreated(subscription, session.metadata?.clerkUserId);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if ((invoice as any).subscription) {
          await handleInvoicePaymentSucceeded(invoice);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment failed for invoice ${invoice.id}`);
        // Handle failed payment - could send email, update subscription status, etc.
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, clerkUserId?: string) {
  try {
    if (!clerkUserId) {
      console.error('No Clerk user ID in subscription metadata');
      return;
    }

    const price = subscription.items.data[0]?.price;
    if (!price) {
      console.error('No price found in subscription');
      return;
    }

    // Map price IDs to plan details
    const planDetails = getPlanDetails(price.id);
    
    await createSubscription({
      userId: clerkUserId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      status: subscription.status,
      priceId: price.id,
      planName: planDetails.name,
      monthlyMinutes: planDetails.minutes,
      priceAmount: price.unit_amount || 0,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    });

    console.log(`Subscription created for user ${clerkUserId}`);
  } catch (error) {
    console.error('Failed to handle subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Update subscription in database
    // This would require a updateSubscription function in the database layer
    console.log(`Subscription updated: ${subscription.id}`);
  } catch (error) {
    console.error('Failed to handle subscription updated:', error);
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  try {
    // Mark subscription as canceled in database
    console.log(`Subscription canceled: ${subscription.id}`);
  } catch (error) {
    console.error('Failed to handle subscription canceled:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log(`Payment succeeded for invoice ${invoice.id}`);
    // Handle successful payment - could reset usage, send confirmation email, etc.
  } catch (error) {
    console.error('Failed to handle invoice payment succeeded:', error);
  }
}

function getPlanDetails(priceId: string) {
  const planMap: Record<string, { name: string; minutes: number }> = {
    'price_essential_monthly': { name: 'Essential', minutes: 600 },
    'price_professional_monthly': { name: 'Professional', minutes: -1 }, // -1 for unlimited
    // Add actual Stripe price IDs here when created
  };

  return planMap[priceId] || { name: 'Unknown', minutes: 0 };
}