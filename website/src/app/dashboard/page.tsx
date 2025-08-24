'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface SubscriptionData {
  id: string;
  plan_name: string;
  status: string;
  monthly_minutes: number;
  current_period_end: string;
}

interface UsageData {
  used: number;
  limit: number;
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData>({ used: 0, limit: 90 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      loadDashboardData();
    } else if (isLoaded && !user) {
      // Redirect to sign in
      window.location.href = '/sign-in';
    }
  }, [user, isLoaded]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard data from API
      const response = await fetch('/api/user/dashboard');
      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }
      
      const { subscription, usage } = await response.json();
      
      setSubscription(subscription);
      setUsage(usage);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { url, error } = await response.json();

      if (error) {
        console.error('Portal error:', error);
        alert('Failed to open customer portal. Please try again.');
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open customer portal. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUsagePercentage = () => {
    if (usage.limit === -1) return 0; // Unlimited
    return Math.min((usage.used / usage.limit) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'trialing': return 'text-blue-400';
      case 'past_due': return 'text-yellow-400';
      case 'canceled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="container min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-2">Loading your dashboard...</h1>
          <p className="opacity-90">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Error loading dashboard</h1>
          <p className="opacity-90 mb-6">{error}</p>
          <button onClick={loadDashboardData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <section className="glass p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.firstName || 'there'}! 👋
            </h1>
            <p className="text-lg opacity-90">
              Manage your SenScript subscription and track your usage
            </p>
          </div>
          <Link href="https://app.senscript.com" className="btn btn-primary">
            Open App
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subscription Status */}
        <section className="glass p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span>💳</span>
            Subscription Status
          </h2>
          
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{subscription.plan_name} Plan</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(subscription.status)} bg-white/10`}>
                  {subscription.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <p className="text-sm opacity-70 mb-1">Monthly Limit</p>
                  <p className="text-xl font-bold">
                    {subscription.monthly_minutes === -1 ? 'Unlimited' : `${subscription.monthly_minutes} min`}
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <p className="text-sm opacity-70 mb-1">Renewal Date</p>
                  <p className="text-xl font-bold">
                    {formatDate(subscription.current_period_end)}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleManageSubscription}
                className="w-full btn mt-4"
              >
                Manage Subscription
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🆓</div>
              <h3 className="text-xl font-bold mb-2">Free Plan</h3>
              <p className="opacity-90 mb-4">You're currently using our free tier</p>
              <Link href="/pricing" className="btn btn-primary">
                Upgrade Plan
              </Link>
            </div>
          )}
        </section>

        {/* Usage Statistics */}
        <section className="glass p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span>📊</span>
            Usage This Month
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Minutes Used</span>
              <span className="text-xl font-bold">
                {usage.used} / {usage.limit === -1 ? '∞' : usage.limit}
              </span>
            </div>

            {usage.limit !== -1 && (
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getUsagePercentage()}%` }}
                ></div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-500">{usage.used}</p>
                <p className="text-sm opacity-70">Minutes Used</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {usage.limit === -1 ? '∞' : usage.limit - usage.used}
                </p>
                <p className="text-sm opacity-70">Remaining</p>
              </div>
            </div>

            {usage.used > usage.limit * 0.8 && usage.limit !== -1 && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium flex items-center gap-2">
                  <span>⚠️</span>
                  You've used {Math.round(getUsagePercentage())}% of your monthly limit
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section className="glass p-6 mt-8">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 p-6 rounded-lg text-center">
            <div className="text-3xl mb-3">🎤</div>
            <h3 className="font-semibold mb-2">Start Recording</h3>
            <p className="text-sm opacity-70 mb-4">Open the SenScript app and begin creating CheatCards</p>
            <Link href="https://app.senscript.com" className="btn btn-primary w-full">
              Open App
            </Link>
          </div>

          <div className="bg-white/5 p-6 rounded-lg text-center">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold mb-2">View Roadmap</h3>
            <p className="text-sm opacity-70 mb-4">See what features we're building next</p>
            <Link href="/roadmap" className="btn w-full">
              View Roadmap
            </Link>
          </div>

          <div className="bg-white/5 p-6 rounded-lg text-center">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold mb-2">Get Support</h3>
            <p className="text-sm opacity-70 mb-4">Need help? Contact our support team</p>
            <Link href="/contact" className="btn w-full">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}