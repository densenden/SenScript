-- SenScript Production Database Schema for Supabase
-- This replaces all mock/demo database implementations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Clerk)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- User preferences
    onboarded BOOLEAN DEFAULT FALSE,
    email_notifications BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Subscriptions table (Stripe integration)
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
    price_id TEXT NOT NULL,
    
    -- Plan details
    plan_name TEXT NOT NULL,
    monthly_minutes INTEGER NOT NULL DEFAULT 0,
    price_amount INTEGER NOT NULL, -- in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    
    -- Billing periods
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_end TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    canceled_at TIMESTAMP WITH TIME ZONE
);

-- Usage tracking (minutes consumed)
CREATE TABLE public.usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Usage details
    minutes_used INTEGER NOT NULL CHECK (minutes_used >= 0),
    source TEXT NOT NULL DEFAULT 'web-app' CHECK (source IN ('web-app', 'website', 'api')),
    session_id TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL
);

-- User settings (persistent preferences)
CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- App settings
    auto_start_listening BOOLEAN DEFAULT FALSE,
    default_card_type TEXT DEFAULT 'flash' CHECK (default_card_type IN ('flash', 'cheat')),
    language TEXT DEFAULT 'auto',
    selected_model TEXT DEFAULT 'auto',
    use_fallback BOOLEAN DEFAULT TRUE,
    
    -- Output preferences
    output_language JSONB DEFAULT '{"auto": true}'::jsonb,
    
    -- Education settings
    education_settings JSONB DEFAULT '{"userLevel": 1, "detailLevel": 5, "exampleComplexity": 3}'::jsonb,
    
    -- API keys (encrypted)
    api_keys JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    UNIQUE(user_id)
);

-- Roadmap items for voting
CREATE TABLE public.roadmap_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('feature', 'improvement', 'integration', 'platform')),
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    priority INTEGER DEFAULT 0,
    
    -- Voting
    vote_count INTEGER DEFAULT 0,
    
    -- Timeline
    estimated_completion TEXT, -- e.g., "Q1 2025", "Next month"
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Roadmap votes
CREATE TABLE public.roadmap_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    roadmap_item_id UUID NOT NULL REFERENCES public.roadmap_items(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    UNIQUE(user_id, roadmap_item_id)
);

-- Contact form submissions
CREATE TABLE public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Form data
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    
    -- Classification
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'support', 'feature_request', 'bug_report', 'billing')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Processing
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    assigned_to TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Listening sessions (detailed usage tracking)
CREATE TABLE public.listening_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Session details
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    source TEXT NOT NULL DEFAULT 'web-app',
    
    -- Generated content
    cards_generated INTEGER DEFAULT 0,
    transcription_length INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Settings audit log
CREATE TABLE public.settings_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Changes
    setting_key TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB NOT NULL,
    
    -- Context
    source TEXT DEFAULT 'web' CHECK (source IN ('web', 'api', 'system')),
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_users_clerk_id ON public.users(clerk_user_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX idx_usage_records_period ON public.usage_records(billing_period_start, billing_period_end);
CREATE INDEX idx_roadmap_votes_user_id ON public.roadmap_votes(user_id);
CREATE INDEX idx_roadmap_votes_item_id ON public.roadmap_votes(roadmap_item_id);
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX idx_listening_sessions_user_id ON public.listening_sessions(user_id);
CREATE INDEX idx_settings_audit_user_id ON public.settings_audit(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roadmap_items_updated_at BEFORE UPDATE ON public.roadmap_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_audit ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Subscriptions - users can only see their own
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- Usage records - users can only see their own
CREATE POLICY "Users can view own usage" ON public.usage_records FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE clerk_user_id = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can create own usage records" ON public.usage_records FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- User settings - users can manage their own settings
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- Roadmap items - public read, voting restricted to authenticated users
CREATE POLICY "Public can view roadmap items" ON public.roadmap_items FOR SELECT TO public USING (true);

-- Roadmap votes - users can manage their own votes
CREATE POLICY "Users can manage own votes" ON public.roadmap_votes FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- Contact submissions - users can submit and view their own
CREATE POLICY "Users can submit contact forms" ON public.contact_submissions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users can view own submissions" ON public.contact_submissions FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE clerk_user_id = auth.jwt() ->> 'sub') OR user_id IS NULL);

-- Listening sessions - users can manage their own sessions
CREATE POLICY "Users can manage own sessions" ON public.listening_sessions FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- Settings audit - users can view their own audit trail
CREATE POLICY "Users can view own audit trail" ON public.settings_audit FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- Insert initial roadmap items
INSERT INTO public.roadmap_items (title, description, category, status, priority, estimated_completion) VALUES
('iOS Native App', 'Native iOS application with full offline support and deeper system integration', 'platform', 'planned', 10, 'Q2 2025'),
('Android Native App', 'Native Android application with advanced audio processing capabilities', 'platform', 'planned', 9, 'Q2 2025'),
('Microsoft Teams Integration', 'Direct integration with Microsoft Teams for seamless meeting capture', 'integration', 'planned', 8, 'Next month'),
('Slack Integration', 'Real-time CheatCard generation during Slack calls and conversations', 'integration', 'planned', 7, 'Q1 2025'),
('Advanced AI Models', 'Support for GPT-4, Claude-3, and specialized domain models', 'feature', 'in_progress', 9, 'Next 2 weeks'),
('Bulk Export Options', 'Export to Anki, Notion, Obsidian, and other knowledge management tools', 'feature', 'planned', 6, 'Q1 2025'),
('Team Workspaces', 'Shared CheatCard collections for teams and educational institutions', 'feature', 'planned', 5, 'Q3 2025'),
('Performance Optimization', 'Sub-1-second CheatCard generation and improved audio processing', 'improvement', 'in_progress', 8, 'Next 4 weeks');

-- Create a function to get user by Clerk ID
CREATE OR REPLACE FUNCTION get_user_by_clerk_id(clerk_id TEXT)
RETURNS public.users AS $$
DECLARE
    user_record public.users;
BEGIN
    SELECT * INTO user_record FROM public.users WHERE clerk_user_id = clerk_id;
    RETURN user_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to upsert user from Clerk webhook
CREATE OR REPLACE FUNCTION upsert_user_from_clerk(
    clerk_id TEXT,
    email_addr TEXT,
    first_n TEXT DEFAULT NULL,
    last_n TEXT DEFAULT NULL,
    profile_img TEXT DEFAULT NULL
)
RETURNS public.users AS $$
DECLARE
    user_record public.users;
BEGIN
    INSERT INTO public.users (clerk_user_id, email, first_name, last_name, profile_image_url)
    VALUES (clerk_id, email_addr, first_n, last_n, profile_img)
    ON CONFLICT (clerk_user_id) 
    DO UPDATE SET 
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        profile_image_url = EXCLUDED.profile_image_url,
        updated_at = TIMEZONE('utc'::text, NOW())
    RETURNING * INTO user_record;
    
    RETURN user_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;