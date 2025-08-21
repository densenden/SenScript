import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, verifyWebhookSignature } from '@/lib/stripe';

// Webhook endpoint for Stripe events
// URL: https://script.sen.studio/api/stripe
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature);
    if (!event) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`Processing Stripe webhook: ${event.type}`);

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'usage_record.summary.created':
        await handleUsageRecordSummaryCreated(event.data.object);
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  
  // TODO: Save customer and subscription info to your database
  // Example:
  // - Extract customer email from session.customer_email
  // - Save subscription ID from session.subscription
  // - Update user's plan status
  // - Send welcome email
  
  const customerEmail = session.customer_email;
  const subscriptionId = session.subscription;
  
  if (subscriptionId) {
    console.log(`New subscription created: ${subscriptionId} for ${customerEmail}`);
    // Update database with new subscription
  } else {
    console.log(`One-time payment completed for ${customerEmail}`);
    // Handle one-time payment (e.g., reload credits)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);
  
  // TODO: Update user's subscription status in your database
  // - Set plan to active
  // - Initialize usage tracking
  // - Send activation email
  
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  
  console.log(`Customer ${customerId} subscribed to ${priceId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  
  // TODO: Handle subscription changes
  // - Plan upgrades/downgrades
  // - Billing cycle changes
  // - Status changes (active, past_due, canceled, etc.)
  
  const status = subscription.status;
  const customerId = subscription.customer as string;
  
  console.log(`Subscription ${subscription.id} status: ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  // TODO: Handle subscription cancellation
  // - Update user's plan to free tier
  // - Send cancellation confirmation
  // - Archive usage data
  
  const customerId = subscription.customer as string;
  console.log(`Subscription canceled for customer: ${customerId}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id);
  
  // TODO: Handle successful payment
  // - Reset usage counters for new billing period
  // - Send payment confirmation
  // - Update payment history
  
  const subscriptionId = invoice.subscription as string;
  const amountPaid = invoice.amount_paid;
  
  console.log(`Payment of ${amountPaid} received for subscription: ${subscriptionId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);
  
  // TODO: Handle failed payment
  // - Notify customer about payment failure
  // - Implement retry logic
  // - Update account status if needed
  
  const customerEmail = invoice.customer_email;
  console.log(`Payment failed for customer: ${customerEmail}`);
}

async function handleUsageRecordSummaryCreated(usageRecord: any) {
  console.log('Usage record summary created:', usageRecord);
  
  // TODO: Log usage for analytics and billing
  // - Track usage patterns
  // - Generate usage reports
  // - Monitor quota limits
}

// GET endpoint for webhook testing
export async function GET() {
  return NextResponse.json({ 
    message: 'SenScript Stripe webhook endpoint',
    url: 'https://script.sen.studio/api/stripe',
    supported_events: [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated', 
      'customer.subscription.deleted',
      'invoice.paid',
      'invoice.payment_failed',
      'usage_record.summary.created'
    ]
  });
}