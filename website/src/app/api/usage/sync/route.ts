import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { recordUsage } from '@/lib/db/database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { minutes, source = 'website', sessionId, metadata } = await request.json();

    if (!minutes || minutes <= 0) {
      return NextResponse.json(
        { error: 'Invalid minutes value' },
        { status: 400 }
      );
    }

    // Record usage in the database
    const success = await recordUsage(userId, minutes, source);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to record usage' },
        { status: 500 }
      );
    }

    // Also sync to web-app if it's available
    try {
      await fetch(`${process.env.SCRIPT_APP_URL || 'http://localhost:3001'}/api/usage/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${generateWebAppToken(userId)}` // You'd implement this
        },
        body: JSON.stringify({
          minutes,
          source,
          sessionId,
          metadata
        })
      });
    } catch (error) {
      // Don't fail the main request if web-app sync fails
      console.warn('Failed to sync usage to web-app:', error);
    }

    return NextResponse.json({
      success: true,
      minutes
    });

  } catch (error) {
    console.error('Usage sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync usage' },
      { status: 500 }
    );
  }
}

// Simple token generation for cross-app communication
// In production, you'd use proper JWT signing
function generateWebAppToken(userId: string): string {
  // This is a simplified implementation
  // In production, use proper JWT with shared secret
  return Buffer.from(JSON.stringify({ sub: userId, iss: 'website' })).toString('base64');
}