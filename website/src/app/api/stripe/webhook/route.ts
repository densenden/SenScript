import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createSubscription, updateUser, getUserById } from '@/lib/db/database';
import { supabase } from '@/lib/db/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        
        if (userId && session.subscription) {
          try {
            // Get subscription details from Stripe
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
            const product = await stripe.products.retrieve(price.product as string);
            
            // Determine plan details
            const planName = product.name || 'Premium Plan';
            const monthlyMinutes = product.metadata?.monthly_minutes ? 
              parseInt(product.metadata.monthly_minutes) : 600; // Default 10 hours
            
            // Create subscription in database
            await createSubscription({
              userId: userId,
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              status: subscription.status,
              priceId: price.id,
              planName: planName,
              monthlyMinutes: monthlyMinutes,
              priceAmount: price.unit_amount || 0,
              currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
            });
            
            console.log(`Subscription created for user: ${userId}`, {
              subscriptionId: subscription.id,
              planName,
              monthlyMinutes
            });
          } catch (error) {
            console.error('Failed to create subscription in database:', error);
            // Don't throw error to avoid webhook retry loops
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        try {
          // Find existing subscription by Stripe subscription ID
          const { data: existingSubscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('stripe_subscription_id', subscription.id)
            .single();
            
          if (existingSubscription && !error) {
            // Get updated price and product info
            const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
            const product = await stripe.products.retrieve(price.product as string);
            
            // Update subscription in database
            const { error: updateError } = await supabase
              .from('subscriptions')
              .update({
              status: subscription.status as any,
              price_id: price.id,
              plan_name: product.name || existingSubscription.plan_name,
              monthly_minutes: product.metadata?.monthly_minutes ? 
                parseInt(product.metadata.monthly_minutes) : existingSubscription.monthly_minutes,
              price_amount: price.unit_amount || 0,
              current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
              trial_end: (subscription as any).trial_end ? 
                new Date((subscription as any).trial_end * 1000).toISOString() : undefined,
              canceled_at: (subscription as any).canceled_at ? 
                new Date((subscription as any).canceled_at * 1000).toISOString() : undefined
              })
              .eq('id', existingSubscription.id);
            
            if (updateError) {
              throw new Error(`Failed to update subscription: ${updateError.message}`);
            }
            
            console.log(`Subscription updated for customer: ${customerId}`, {
              subscriptionId: subscription.id,
              status: subscription.status,
              planName: product.name
            });
          } else {
            console.warn(`No existing subscription found for Stripe subscription: ${subscription.id}`);
          }
        } catch (error) {
          console.error('Failed to update subscription in database:', error);
          // Don't throw error to avoid webhook retry loops
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        try {
          // Find existing subscription by Stripe subscription ID
          const { data: existingSubscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('stripe_subscription_id', subscription.id)
            .single();
            
          if (existingSubscription && !error) {
            // Update subscription status to canceled
            const { error: updateError } = await supabase
              .from('subscriptions')
              .update({
              status: 'canceled',
              canceled_at: new Date().toISOString()
            });
            
            console.log(`Subscription canceled for customer: ${customerId}`, {
              subscriptionId: subscription.id,
              userId: existingSubscription.user_id
            });
          } else {
            console.warn(`No existing subscription found for Stripe subscription: ${subscription.id}`);
          }
        } catch (error) {
          console.error('Failed to cancel subscription in database:', error);
          // Don't throw error to avoid webhook retry loops
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}