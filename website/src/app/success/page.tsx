'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Success() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      // You could verify the session with Stripe here if needed
      // For now, we'll just show success
      setLoading(false);
    } else {
      setError('Invalid session');
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-2">Processing your subscription...</h1>
          <p className="opacity-90">Please wait while we set up your account</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="opacity-90 mb-6">{error}</p>
          <Link href="/pricing" className="btn btn-primary">
            Back to Pricing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container min-h-screen flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-6xl mb-6">🎉</div>
        
        <h1 className="text-4xl font-bold mb-4">
          Welcome to <span className="text-orange-500">SenScript</span>!
        </h1>
        
        <p className="text-xl opacity-90 mb-8 leading-relaxed">
          Your subscription is now active. You can start creating CheatCards immediately 
          with your new plan benefits.
        </p>

        <div className="glass p-6 mb-8 max-w-md mx-auto">
          <h3 className="font-semibold mb-3">What happens next?</h3>
          <div className="text-sm space-y-2 text-left">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>Access the full SenScript web app</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>Start your first listening session</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>Generate professional CheatCards</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>Export to your favorite tools</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="https://app.senscript.com" className="btn btn-primary text-lg px-8 py-4">
            Start Creating CheatCards
          </Link>
          <Link href="/dashboard" className="btn text-lg px-8 py-4">
            View Dashboard
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm opacity-90">
            💡 <strong>Pro Tip:</strong> Check your email for your welcome guide and setup instructions. 
            Need help? <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
}