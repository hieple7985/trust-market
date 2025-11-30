import { NextRequest, NextResponse } from 'next/server';
import { createAIResolver } from '@/lib/ai-resolver';
import { createICPResolver } from '@/lib/icp-resolver';

/**
 * API Route: POST /api/resolve
 * 
 * Trigger AI resolution for markets on BNB and/or ICP
 * 
 * Body:
 * - chain (optional): 'bnb' | 'icp' | 'all' (default: 'all')
 * - questionId (optional): Specific market to resolve
 * 
 * Example:
 * POST /api/resolve
 * { "chain": "all" }
 */
export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const chain = body.chain || 'all';

    const results: { bnb?: string; icp?: { resolved: number; total: number } } = {};

    // Resolve BNB markets
    if ((chain === 'all' || chain === 'bnb') && process.env.AI_BOT_PRIVATE_KEY) {
      try {
        console.log('Resolving BNB markets...');
        const bnbResolver = createAIResolver();
        await bnbResolver.monitorAndResolveMarkets();
        results.bnb = 'completed';
      } catch (error: any) {
        console.error('BNB resolution error:', error.message);
        results.bnb = `error: ${error.message}`;
      }
    }

    // Resolve ICP markets
    if (chain === 'all' || chain === 'icp') {
      try {
        console.log('Resolving ICP markets...');
        const icpResolver = createICPResolver();
        results.icp = await icpResolver.monitorAndResolveMarkets();
      } catch (error: any) {
        console.error('ICP resolution error:', error.message);
        results.icp = { resolved: 0, total: 0 };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Resolution completed',
      results,
    });
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
    message: 'AI Resolution API is running (BNB + ICP)',
    configured: {
      openai: !!process.env.OPENAI_API_KEY,
      bnb: {
        privateKey: !!process.env.AI_BOT_PRIVATE_KEY,
        contract: !!process.env.NEXT_PUBLIC_AIORACLE_ADDRESS,
      },
      icp: {
        canisterId: process.env.NEXT_PUBLIC_ICP_BACKEND_CANISTER_ID || 'oyleh-yqaaa-aaaau-aczbq-cai',
        host: process.env.NEXT_PUBLIC_IC_HOST || 'https://icp0.io',
      },
    },
  });
}

