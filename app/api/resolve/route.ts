import { NextRequest, NextResponse } from 'next/server';
import { createAIResolver } from '@/lib/ai-resolver';

/**
 * API Route: POST /api/resolve
 * 
 * Manually trigger AI resolution for a specific market or all markets
 * 
 * Body:
 * - questionId (optional): Specific market to resolve
 * 
 * Example:
 * POST /api/resolve
 * { "questionId": "0x123..." }
 * 
 * Or resolve all markets:
 * POST /api/resolve
 */
export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    if (!process.env.AI_BOT_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'AI bot private key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { questionId } = body;

    // Create resolver
    const resolver = createAIResolver();

    if (questionId) {
      // Resolve specific market
      // Note: You would need to fetch market details first
      return NextResponse.json(
        { error: 'Single market resolution not yet implemented' },
        { status: 501 }
      );
    } else {
      // Resolve all markets
      await resolver.monitorAndResolveMarkets();

      return NextResponse.json({
        success: true,
        message: 'Markets resolved successfully',
      });
    }
  } catch (error: any) {
    console.error('Error in resolve API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resolve markets' },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'AI Resolution API is running',
    configured: {
      openai: !!process.env.OPENAI_API_KEY,
      privateKey: !!process.env.AI_BOT_PRIVATE_KEY,
      contract: !!process.env.NEXT_PUBLIC_AIORACLE_ADDRESS,
    },
  });
}

