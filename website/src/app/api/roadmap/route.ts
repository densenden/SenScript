import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Mock roadmap data for development/demo
const mockRoadmapItems = [
  {
    id: '1',
    title: 'iOS Native App',
    description: 'Native iOS application with enhanced performance and offline capabilities',
    status: 'planned',
    priority: 1,
    votes: 127,
    category: 'platform',
    estimated_completion: '2025-Q2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2', 
    title: 'Android Native App',
    description: 'Native Android application with Material Design and system integrations',
    status: 'planned',
    priority: 2,
    votes: 89,
    category: 'platform',
    estimated_completion: '2025-Q3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Performance Optimization',
    description: 'Improve speech recognition speed and accuracy by 40%',
    status: 'in_progress', 
    priority: 1,
    votes: 156,
    category: 'performance',
    estimated_completion: '2025-Q1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Offline Mode',
    description: 'Enable CheatCard creation without internet connectivity',
    status: 'planned',
    priority: 3,
    votes: 73,
    category: 'feature',
    estimated_completion: '2025-Q2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Multi-language Support',
    description: 'Support for Spanish, French, German, and Japanese',
    status: 'completed',
    priority: 2,
    votes: 94,
    category: 'feature', 
    estimated_completion: '2024-Q4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    // Try to load from database first, fall back to mock data
    let items = mockRoadmapItems;
    let userVotes: string[] = [];

    try {
      // Attempt to load from database if Supabase is configured
      const { getRoadmapItems, getUserVotes } = await import('@/lib/db/database');
      items = await getRoadmapItems();
      
      if (userId) {
        userVotes = await getUserVotes(userId);
      }
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      console.log('Database not available, using mock data:', errorMessage);
      // Use mock data - no user votes in mock mode
      userVotes = [];
    }

    return NextResponse.json({
      items,
      userVotes
    });

  } catch (error) {
    console.error('Roadmap API error:', error);
    return NextResponse.json(
      { error: 'Failed to load roadmap data' },
      { status: 500 }
    );
  }
}