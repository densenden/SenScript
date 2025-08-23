// Production Supabase Database Client
// Replaces all mock database implementations

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Database types for better type safety
export interface User {
  id: string;
  clerk_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
  last_active?: string;
  onboarded: boolean;
  email_notifications: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  price_id: string;
  plan_name: string;
  monthly_minutes: number;
  price_amount: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
  canceled_at?: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  minutes_used: number;
  source: 'web-app' | 'website' | 'api';
  session_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  billing_period_start: string;
  billing_period_end: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  auto_start_listening: boolean;
  default_card_type: 'flash' | 'cheat';
  language: string;
  selected_model: string;
  use_fallback: boolean;
  output_language: Record<string, any>;
  education_settings: Record<string, any>;
  api_keys: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: 'feature' | 'improvement' | 'integration' | 'platform';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority: number;
  vote_count: number;
  estimated_completion?: string;
  created_at: string;
  updated_at: string;
}

export interface RoadmapVote {
  id: string;
  user_id: string;
  roadmap_item_id: string;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  category: 'general' | 'support' | 'feature_request' | 'bug_report' | 'billing';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ListeningSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  source: string;
  cards_generated: number;
  transcription_length: number;
  metadata?: Record<string, any>;
  created_at: string;
}

// Database service class
export class DatabaseService {
  
  // User Management
  async getUserByClerkId(clerkUserId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data;
  }

  async upsertUser(userData: {
    clerkUserId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  }): Promise<User> {
    const { data, error } = await supabase
      .rpc('upsert_user_from_clerk', {
        clerk_id: userData.clerkUserId,
        email_addr: userData.email,
        first_n: userData.firstName || null,
        last_n: userData.lastName || null,
        profile_img: userData.profileImageUrl || null
      });

    if (error) {
      throw new Error(`Failed to upsert user: ${error.message}`);
    }

    return data;
  }

  // Subscription Management
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get subscription: ${error.message}`);
    }

    return data;
  }

  async createSubscription(subscriptionData: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }

    return data;
  }

  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }

    return data;
  }

  // Usage Tracking
  async recordUsage(usageData: {
    userId: string;
    minutesUsed: number;
    source?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }): Promise<UsageRecord> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('usage_records')
      .insert({
        user_id: usageData.userId,
        minutes_used: usageData.minutesUsed,
        source: usageData.source || 'web-app',
        session_id: usageData.sessionId,
        metadata: usageData.metadata || {},
        billing_period_start: periodStart.toISOString(),
        billing_period_end: periodEnd.toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record usage: ${error.message}`);
    }

    return data;
  }

  async getUserUsage(userId: string, periodStart?: Date, periodEnd?: Date): Promise<{ totalMinutes: number; records: UsageRecord[] }> {
    let query = supabase
      .from('usage_records')
      .select('*')
      .eq('user_id', userId);

    if (periodStart && periodEnd) {
      query = query
        .gte('billing_period_start', periodStart.toISOString())
        .lte('billing_period_end', periodEnd.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get usage: ${error.message}`);
    }

    const totalMinutes = data.reduce((sum, record) => sum + record.minutes_used, 0);

    return { totalMinutes, records: data };
  }

  // User Settings
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get user settings: ${error.message}`);
    }

    return data;
  }

  async upsertUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert user settings: ${error.message}`);
    }

    return data;
  }

  // Roadmap & Voting
  async getRoadmapItems(): Promise<RoadmapItem[]> {
    const { data, error } = await supabase
      .from('roadmap_items')
      .select('*')
      .order('priority', { ascending: false })
      .order('vote_count', { ascending: false });

    if (error) {
      throw new Error(`Failed to get roadmap items: ${error.message}`);
    }

    return data;
  }

  async voteOnRoadmapItem(userId: string, itemId: string): Promise<{ success: boolean; vote_count: number }> {
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('roadmap_votes')
      .select('id')
      .eq('user_id', userId)
      .eq('roadmap_item_id', itemId)
      .single();

    if (existingVote) {
      throw new Error('User has already voted on this item');
    }

    // Insert vote
    const { error: voteError } = await supabase
      .from('roadmap_votes')
      .insert({
        user_id: userId,
        roadmap_item_id: itemId
      });

    if (voteError) {
      throw new Error(`Failed to record vote: ${voteError.message}`);
    }

    // Update vote count
    const { data: updatedItem, error: updateError } = await supabase
      .from('roadmap_items')
      .update({
        vote_count: supabase.rpc('increment_vote_count', { item_id: itemId })
      })
      .eq('id', itemId)
      .select('vote_count')
      .single();

    if (updateError) {
      throw new Error(`Failed to update vote count: ${updateError.message}`);
    }

    return { success: true, vote_count: updatedItem.vote_count };
  }

  async getUserVotes(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('roadmap_votes')
      .select('roadmap_item_id')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get user votes: ${error.message}`);
    }

    return data.map(vote => vote.roadmap_item_id);
  }

  // Contact Form
  async submitContactForm(formData: {
    userId?: string;
    name: string;
    email: string;
    subject?: string;
    message: string;
    category?: string;
  }): Promise<ContactSubmission> {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert({
        user_id: formData.userId || null,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        category: (formData.category as any) || 'general',
        priority: 'normal',
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit contact form: ${error.message}`);
    }

    return data;
  }

  // Listening Sessions
  async createListeningSession(sessionData: {
    userId: string;
    source?: string;
    metadata?: Record<string, any>;
  }): Promise<ListeningSession> {
    const { data, error } = await supabase
      .from('listening_sessions')
      .insert({
        user_id: sessionData.userId,
        started_at: new Date().toISOString(),
        source: sessionData.source || 'web-app',
        cards_generated: 0,
        transcription_length: 0,
        metadata: sessionData.metadata || {}
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create listening session: ${error.message}`);
    }

    return data;
  }

  async endListeningSession(sessionId: string, data: {
    cardsGenerated: number;
    transcriptionLength: number;
    metadata?: Record<string, any>;
  }): Promise<ListeningSession> {
    const endTime = new Date();
    
    const { data: session, error } = await supabase
      .from('listening_sessions')
      .update({
        ended_at: endTime.toISOString(),
        cards_generated: data.cardsGenerated,
        transcription_length: data.transcriptionLength,
        metadata: data.metadata
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to end listening session: ${error.message}`);
    }

    // Calculate duration and update
    if (session.started_at) {
      const startTime = new Date(session.started_at);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      const { data: updatedSession, error: updateError } = await supabase
        .from('listening_sessions')
        .update({ duration_minutes: durationMinutes })
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update session duration: ${updateError.message}`);
      }

      return updatedSession;
    }

    return session;
  }
}

// Export singleton instance
export const db = new DatabaseService();