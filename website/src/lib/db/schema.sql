-- User subscription and usage tracking tables
-- This can be used with SQLite, PostgreSQL, or any SQL database

-- Users table (extends Clerk user data)
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  profile_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free', -- free, pro, enterprise
  status TEXT NOT NULL DEFAULT 'trial', -- trial, active, cancelled, expired
  minutes_total INTEGER NOT NULL DEFAULT 90,
  minutes_used INTEGER NOT NULL DEFAULT 0,
  trial_ends_at TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage sessions table
CREATE TABLE usage_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  minutes_consumed INTEGER NOT NULL DEFAULT 0,
  cards_generated INTEGER NOT NULL DEFAULT 0,
  language TEXT DEFAULT 'en',
  source TEXT, -- 'demo', 'dashboard', 'direct'
  session_data JSONB, -- Store session metadata
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CheatCards table (optional - for storing generated cards)
CREATE TABLE cheat_cards (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES usage_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- 'fact', 'todo', 'quote', 'concept'
  confidence REAL DEFAULT 0.0,
  tags TEXT[], -- Array of tags
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_usage_sessions_user_id ON usage_sessions(user_id);
CREATE INDEX idx_usage_sessions_date ON usage_sessions(created_at);
CREATE INDEX idx_cheat_cards_user_id ON cheat_cards(user_id);
CREATE INDEX idx_cheat_cards_session_id ON cheat_cards(session_id);