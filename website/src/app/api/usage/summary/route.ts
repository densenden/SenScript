import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'day';

    // Mock usage data for now - replace with actual database queries
    const mockUsageData = {
      day: {
        totalRequests: 45,
        successfulRequests: 42,
        errorRate: 0.067,
        averageResponseTime: 1.2,
        cardCount: 23,
        transcriptionMinutes: 12.5
      },
      week: {
        totalRequests: 312,
        successfulRequests: 298,
        errorRate: 0.045,
        averageResponseTime: 1.1,
        cardCount: 156,
        transcriptionMinutes: 87.3
      },
      month: {
        totalRequests: 1240,
        successfulRequests: 1185,
        errorRate: 0.044,
        averageResponseTime: 1.15,
        cardCount: 587,
        transcriptionMinutes: 324.7
      }
    };

    const usageStats = mockUsageData[range as keyof typeof mockUsageData] || mockUsageData.day;

    return NextResponse.json({
      success: true,
      data: {
        range,
        stats: usageStats,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Usage summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage summary' },
      { status: 500 }
    );
  }
}