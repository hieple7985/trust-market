#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

/**
 * AI Bot Service
 * 
 * This service monitors prediction markets and automatically resolves them
 * using GPT-4 when the resolution time is reached.
 * 
 * Usage:
 * 1. Set environment variables:
 *    - OPENAI_API_KEY: Your OpenAI API key
 *    - AI_BOT_PRIVATE_KEY: Private key for the AI bot wallet
 *    - NEXT_PUBLIC_AIORACLE_ADDRESS: AIOracle contract address
 * 
 * 2. Run the bot:
 *    - One-time: pnpm tsx services/ai-bot.ts
 *    - Continuous: pnpm tsx services/ai-bot.ts --watch
 */

import { createAIResolver } from '../lib/ai-resolver';

async function main() {
  console.log('🤖 AI Bot Service Starting...\n');

  // Check environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not set');
    process.exit(1);
  }

  if (!process.env.AI_BOT_PRIVATE_KEY) {
    console.error('❌ AI_BOT_PRIVATE_KEY not set');
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_AIORACLE_ADDRESS) {
    console.error('❌ NEXT_PUBLIC_AIORACLE_ADDRESS not set');
    process.exit(1);
  }

  console.log('✅ Environment variables configured');
  console.log(`📝 Contract: ${process.env.NEXT_PUBLIC_AIORACLE_ADDRESS}\n`);

  // Create resolver instance
  const resolver = createAIResolver();

  // Check if running in watch mode
  const watchMode = process.argv.includes('--watch');

  if (watchMode) {
    console.log('👀 Running in watch mode (checking every 5 minutes)...\n');

    // Run immediately
    await runResolutionCycle(resolver);

    // Then run every 5 minutes
    setInterval(async () => {
      await runResolutionCycle(resolver);
    }, 5 * 60 * 1000); // 5 minutes
  } else {
    console.log('🔄 Running one-time resolution cycle...\n');
    await runResolutionCycle(resolver);
    console.log('\n✅ Resolution cycle complete');
    process.exit(0);
  }
}

async function runResolutionCycle(resolver: any) {
  try {
    console.log(`[${new Date().toISOString()}] Starting resolution cycle...`);
    await resolver.monitorAndResolveMarkets();
    console.log(`[${new Date().toISOString()}] Resolution cycle complete\n`);
  } catch (error) {
    console.error('❌ Error in resolution cycle:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down AI Bot Service...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down AI Bot Service...');
  process.exit(0);
});

// Run the bot
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

