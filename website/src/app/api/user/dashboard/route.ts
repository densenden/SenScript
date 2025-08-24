import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let subscription = null;
    let usage = { used: 0, limit: 90 };

    try {
      // Try to load from database if available
      const { getUserSubscription, getUserUsage } = await import('@/lib/db/database');
      
      const [subData, usageData] = await Promise.all([
        getUserSubscription(userId).catch(() => null),
        getUserUsage(userId).catch(() => ({ used: 0, limit: 90 }))
      ]);
      
      subscription = subData;
      usage = usageData;
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      console.log('Database not available for dashboard, using defaults:', errorMessage);
      // Use default values - no subscription, basic usage
      subscription = null;
      usage = { used: 0, limit: 90 };
    }

    return NextResponse.json({
      subscription,
      usage
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}