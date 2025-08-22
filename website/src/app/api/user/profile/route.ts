import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    
    // Mock user data - in production, this would come from your database
    const userData = {
      id: userId,
      email: user?.emailAddresses[0]?.emailAddress,
      firstName: user?.firstName,
      lastName: user?.lastName,
      profileImage: user?.imageUrl,
      subscription: {
        status: 'trial', // trial, active, cancelled, expired
        plan: 'free', // free, pro, enterprise
        minutesUsed: Math.floor(Math.random() * 45), // Mock usage
        minutesTotal: 90,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      },
      stats: {
        totalSessions: Math.floor(Math.random() * 12) + 1,
        totalCards: Math.floor(Math.random() * 150) + 25,
        languagesUsed: ['English', 'German'],
        averageSessionLength: '12 minutes',
      },
      createdAt: user?.createdAt,
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}