// Production database functions for SenScript
// Real implementations using Supabase

import { db, type User, type Subscription, type UsageRecord, type UserSettings, type RoadmapItem, type ContactSubmission } from './supabase';
import { auth } from '@clerk/nextjs/server';

// Helper function to get current user
async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;
  
  return await db.getUserByClerkId(userId);
}

// User functions
export async function getUserByEmail(email: string): Promise<User | null> {
  // Note: This would require a separate query or index on email
  // For now, we'll use the Clerk user ID approach
  const { userId } = await auth();
  if (!userId) return null;
  
  return await db.getUserByClerkId(userId);
}

export async function getUserById(id: string): Promise<User | null> {
  return await db.getUserByClerkId(id);
}

export async function createUser(userData: {
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}): Promise<User> {
  return await db.upsertUser(userData);
}

export async function updateUser(clerkUserId: string, userData: {
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}): Promise<User | null> {
  const currentUser = await db.getUserByClerkId(clerkUserId);
  if (!currentUser) return null;

  return await db.upsertUser({
    clerkUserId,
    email: userData.email || currentUser.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    profileImageUrl: userData.profileImageUrl
  });
}

// Voting functions
export async function getUserVotes(userId: string): Promise<string[]> {
  const user = await db.getUserByClerkId(userId);
  if (!user) throw new Error('User not found');
  
  return await db.getUserVotes(user.id);
}

export async function addVote(userId: string, itemId: string): Promise<boolean> {
  try {
    const user = await db.getUserByClerkId(userId);
    if (!user) throw new Error('User not found');
    
    await db.voteOnRoadmapItem(user.id, itemId);
    return true;
  } catch (error) {
    console.error('Failed to add vote:', error);
    return false;
  }
}

export async function removeVote(userId: string, itemId: string): Promise<boolean> {
  // Note: Removing votes is not currently implemented in the schema
  // This would require additional logic to decrement vote counts
  throw new Error('Vote removal not yet implemented');
}

export async function getVoteCount(itemId: string): Promise<number> {
  const roadmapItems = await db.getRoadmapItems();
  const item = roadmapItems.find(item => item.id === itemId);
  return item ? item.votes : 0;
}

export async function getRoadmapItems(): Promise<RoadmapItem[]> {
  return await db.getRoadmapItems();
}

// Contact form function
export async function submitContactForm(formData: {
  name: string;
  email: string;
  subject?: string;
  message: string;
  category?: string;
}): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    
    await db.submitContactForm({
      userId: user?.id,
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      category: formData.category
    });
    
    return true;
  } catch (error) {
    console.error('Failed to submit contact form:', error);
    return false;
  }
}

// Usage tracking functions
export async function recordUsage(userId: string, minutes: number, source: string = 'website'): Promise<boolean> {
  try {
    const user = await db.getUserByClerkId(userId);
    if (!user) throw new Error('User not found');
    
    await db.recordUsage({
      userId: user.id,
      minutesUsed: minutes,
      source: source as any
    });
    
    return true;
  } catch (error) {
    console.error('Failed to record usage:', error);
    return false;
  }
}

export async function getUserUsage(userId: string): Promise<{ used: number; limit: number }> {
  try {
    const user = await db.getUserByClerkId(userId);
    if (!user) return { used: 0, limit: 90 }; // Default free tier
    
    // Get current month usage
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const { totalMinutes } = await db.getUserUsage(user.id, periodStart, periodEnd);
    
    // Get user subscription to determine limit
    const subscription = await db.getUserSubscription(user.id);
    const limit = subscription ? subscription.monthly_minutes : 90; // Free tier default
    
    return { used: totalMinutes, limit };
  } catch (error) {
    console.error('Failed to get user usage:', error);
    return { used: 0, limit: 90 };
  }
}

// Subscription functions
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const user = await db.getUserByClerkId(userId);
    if (!user) return null;
    
    return await db.getUserSubscription(user.id);
  } catch (error) {
    console.error('Failed to get user subscription:', error);
    return null;
  }
}

export async function createSubscription(subscriptionData: {
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  priceId: string;
  planName: string;
  monthlyMinutes: number;
  priceAmount: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}): Promise<Subscription> {
  const user = await db.getUserByClerkId(subscriptionData.userId);
  if (!user) throw new Error('User not found');
  
  return await db.createSubscription({
    user_id: user.id,
    stripe_subscription_id: subscriptionData.stripeSubscriptionId,
    stripe_customer_id: subscriptionData.stripeCustomerId,
    status: subscriptionData.status as any,
    price_id: subscriptionData.priceId,
    plan_name: subscriptionData.planName,
    monthly_minutes: subscriptionData.monthlyMinutes,
    price_amount: subscriptionData.priceAmount,
    currency: 'usd',
    current_period_start: subscriptionData.currentPeriodStart.toISOString(),
    current_period_end: subscriptionData.currentPeriodEnd.toISOString()
  });
}

// User settings functions
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const user = await db.getUserByClerkId(userId);
    if (!user) return null;
    
    return await db.getUserSettings(user.id);
  } catch (error) {
    console.error('Failed to get user settings:', error);
    return null;
  }
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings | null> {
  try {
    const user = await db.getUserByClerkId(userId);
    if (!user) return null;
    
    return await db.upsertUserSettings(user.id, settings);
  } catch (error) {
    console.error('Failed to update user settings:', error);
    return null;
  }
}

// Listening session functions
export async function createListeningSession(userId: string, source: string = 'website'): Promise<string | null> {
  try {
    const user = await db.getUserByClerkId(userId);
    if (!user) return null;
    
    const session = await db.createListeningSession({
      userId: user.id,
      source
    });
    
    return session.id;
  } catch (error) {
    console.error('Failed to create listening session:', error);
    return null;
  }
}

export async function endListeningSession(sessionId: string, data: {
  cardsGenerated: number;
  transcriptionLength: number;
}): Promise<boolean> {
  try {
    await db.endListeningSession(sessionId, data);
    return true;
  } catch (error) {
    console.error('Failed to end listening session:', error);
    return false;
  }
}

// Legacy compatibility - keep existing interface
export class DatabaseService {
  static async createUser(userData: { clerkUserId: string; email: string; firstName?: string; lastName?: string }): Promise<User> {
    return await createUser(userData);
  }

  static async getUserById(clerkUserId: string): Promise<User | null> {
    return await getUserById(clerkUserId);
  }

  static async updateUser(clerkUserId: string, updates: Partial<User>): Promise<User | null> {
    return await updateUser(clerkUserId, updates);
  }

  static async getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    return await getUserSubscription(userId);
  }

  static async createSubscription(subscriptionData: any): Promise<Subscription> {
    return await createSubscription(subscriptionData);
  }
}

// Export types for external use
export type { User, Subscription, UsageRecord, UserSettings, RoadmapItem, ContactSubmission };