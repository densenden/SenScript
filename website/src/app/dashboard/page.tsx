'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  subscription: {
    status: string;
    plan: string;
    minutesUsed: number;
    minutesTotal: number;
    expiresAt: string;
  };
  stats: {
    totalSessions: number;
    totalCards: number;
    languagesUsed: string[];
    averageSessionLength: string;
  };
  createdAt: string;
}

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Fetch user data from API
      fetchUserData();
    }
  }, [isLoaded, isSignedIn]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSenScript = () => {
    // Redirect to script.sen.studio with auth token
    const scriptUrl = `${process.env.NEXT_PUBLIC_SCRIPT_APP_URL || 'https://script.sen.studio'}?auth=${user?.id}`;
    window.open(scriptUrl, '_blank');
  };

  if (!isLoaded || loading) {
    return (
      <div className="container">
        <div className="glass p-8 content-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container">
        <div className="glass p-8 content-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-lg opacity-90 mb-8">You need to be signed in to access your dashboard.</p>
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container">
        <div className="glass p-8 content-center">
          <h1 className="text-3xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="text-lg opacity-90 mb-8">Unable to load your account information.</p>
          <button onClick={fetchUserData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Welcome Section */}
      <section className="glass p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0]}!
            </h1>
            <p className="text-xl opacity-90">Ready to turn conversations into CheatCards?</p>
          </div>
          <button
            onClick={startSenScript}
            className="btn btn-primary text-lg px-8 py-4 flex items-center space-x-2"
          >
            <span className="material-symbols-outlined">play_arrow</span>
            <span>Start SenScript</span>
          </button>
        </div>
      </section>

      {/* Usage Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="glass p-6 text-center">
          <div className="text-4xl font-bold text-purple-400 mb-2">
            {userData.stats.totalCards}
          </div>
          <div className="text-sm opacity-80">CheatCards Created</div>
          <div className="text-xs opacity-60 mt-2">
            Across {userData.stats.totalSessions} sessions
          </div>
        </div>
        <div className="glass p-6 text-center">
          <div className="text-4xl font-bold text-orange-500 mb-2">
            {userData.subscription.minutesTotal - userData.subscription.minutesUsed}
          </div>
          <div className="text-sm opacity-80">Minutes Remaining</div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-4">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((userData.subscription.minutesTotal - userData.subscription.minutesUsed) / userData.subscription.minutesTotal) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        <div className="glass p-6 text-center">
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {userData.subscription.minutesUsed}
          </div>
          <div className="text-sm opacity-80">Minutes Used</div>
          <div className="text-xs opacity-60 mt-2">
            Total processed time
          </div>
        </div>

        <div className="glass p-6 text-center">
          <div className="text-2xl font-bold text-green-400 mb-2 capitalize">
            {userData.subscription.plan}
          </div>
          <div className="text-sm opacity-80">Current Plan</div>
          <div className="text-xs opacity-60 mt-2 capitalize">
            {userData.subscription.status}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="glass p-8">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={startSenScript}
            className="glass p-6 text-center hover:bg-white/10 transition-colors group"
          >
            <span className="material-symbols-outlined icon-xl text-orange-500 mb-4 block group-hover:scale-110 transition-transform">
              record_voice_over
            </span>
            <h3 className="font-semibold mb-2">Start Recording</h3>
            <p className="text-sm opacity-80">Begin creating CheatCards</p>
          </button>

          <Link href="/pricing" className="glass p-6 text-center hover:bg-white/10 transition-colors group">
            <span className="material-symbols-outlined icon-xl text-blue-400 mb-4 block group-hover:scale-110 transition-transform">
              upgrade
            </span>
            <h3 className="font-semibold mb-2">Upgrade Plan</h3>
            <p className="text-sm opacity-80">Get more minutes & features</p>
          </Link>

          <Link href="/dashboard/history" className="glass p-6 text-center hover:bg-white/10 transition-colors group">
            <span className="material-symbols-outlined icon-xl text-green-400 mb-4 block group-hover:scale-110 transition-transform">
              history
            </span>
            <h3 className="font-semibold mb-2">View History</h3>
            <p className="text-sm opacity-80">See your CheatCards</p>
          </Link>

          <Link href="/dashboard/settings" className="glass p-6 text-center hover:bg-white/10 transition-colors group">
            <span className="material-symbols-outlined icon-xl text-purple-400 mb-4 block group-hover:scale-110 transition-transform">
              settings
            </span>
            <h3 className="font-semibold mb-2">Settings</h3>
            <p className="text-sm opacity-80">Manage your account</p>
          </Link>
        </div>
      </section>

      {/* Getting Started Guide */}
      {userData.subscription.minutesUsed === 0 && (
        <section className="glass p-8">
          <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Click "Start SenScript"</h3>
                <p className="text-sm opacity-80">Opens script.sen.studio in a new tab</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Join a Meeting or Start Recording</h3>
                <p className="text-sm opacity-80">Works with Teams, Zoom, Meet, or any audio source</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Watch CheatCards Generate</h3>
                <p className="text-sm opacity-80">AI creates study materials in real-time</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}