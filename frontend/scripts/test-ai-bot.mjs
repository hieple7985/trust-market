#!/usr/bin/env node

import * as dotenv from 'dotenv';
import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';

dotenv.config({ path: '.env.local' });

console.log('🧪 Testing AI Bot Configuration\n');
console.log('='.repeat(80));
console.log('');

// 1. Check environment variables
console.log('📝 Step 1: Checking environment variables...');
const checks = {
  'OPENAI_API_KEY': !!process.env.OPENAI_API_KEY,
  'AI_BOT_PRIVATE_KEY': !!process.env.AI_BOT_PRIVATE_KEY,
  'NEXT_PUBLIC_AIORACLE_ADDRESS': !!process.env.NEXT_PUBLIC_AIORACLE_ADDRESS,
  'NEXT_PUBLIC_BNB_TESTNET_RPC': !!process.env.NEXT_PUBLIC_BNB_TESTNET_RPC,
};

Object.entries(checks).forEach(([key, value]) => {
  console.log(`   ${value ? '✅' : '❌'} ${key}: ${value ? 'Set' : 'Missing'}`);
});
console.log('');

if (!Object.values(checks).every(v => v)) {
  console.error('❌ Some environment variables are missing!');
  process.exit(1);
}

// 2. Test RPC connection
console.log('📝 Step 2: Testing RPC connection...');
try {
  const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(process.env.NEXT_PUBLIC_BNB_TESTNET_RPC),
  });

  const blockNumber = await publicClient.getBlockNumber();
  console.log(`   ✅ Connected! Latest block: ${blockNumber}`);
  console.log('');

  // 3. Check contract
  console.log('📝 Step 3: Checking contract...');
  console.log(`   Contract: ${process.env.NEXT_PUBLIC_AIORACLE_ADDRESS}`);
  
  // Try to read from contract
  const code = await publicClient.getBytecode({
    address: process.env.NEXT_PUBLIC_AIORACLE_ADDRESS,
  });
  
  if (code && code !== '0x') {
    console.log('   ✅ Contract exists and has code');
  } else {
    console.log('   ❌ Contract not found or has no code');
  }
  console.log('');

  // 4. Check for markets ready to resolve
  console.log('📝 Step 4: Checking for markets ready to resolve...');
  
  // Import the AI_ORACLE_ABI
  const AI_ORACLE_ABI = [
    {
      inputs: [{ internalType: 'bytes32', name: 'questionId', type: 'bytes32' }],
      name: 'getMarket',
      outputs: [
        {
          components: [
            { internalType: 'bytes32', name: 'questionId', type: 'bytes32' },
            { internalType: 'string', name: 'question', type: 'string' },
            { internalType: 'uint256', name: 'resolutionTime', type: 'uint256' },
            { internalType: 'address', name: 'proposer', type: 'address' },
            { internalType: 'bool', name: 'outcome', type: 'bool' },
            { internalType: 'uint256', name: 'proposalTimestamp', type: 'uint256' },
            { internalType: 'uint256', name: 'livenessEnd', type: 'uint256' },
            { internalType: 'uint8', name: 'status', type: 'uint8' },
            { internalType: 'string', name: 'reasoning', type: 'string' },
            { internalType: 'string[]', name: 'sources', type: 'string[]' },
          ],
          internalType: 'struct AIOracle.Market',
          name: 'market',
          type: 'tuple',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'bytes32', name: 'questionId', type: 'bytes32' },
        { indexed: false, internalType: 'string', name: 'question', type: 'string' },
        { indexed: false, internalType: 'uint256', name: 'resolutionTime', type: 'uint256' },
        { indexed: false, internalType: 'uint256', name: 'liveness', type: 'uint256' },
        { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      ],
      name: 'MarketCreated',
      type: 'event',
    },
  ];

  // Get recent MarketCreated events
  const latestBlock = await publicClient.getBlockNumber();
  const fromBlock = latestBlock - 200000n; // Last ~7 days

  const events = await publicClient.getContractEvents({
    address: process.env.NEXT_PUBLIC_AIORACLE_ADDRESS,
    abi: AI_ORACLE_ABI,
    eventName: 'MarketCreated',
    fromBlock,
    toBlock: latestBlock,
  });

  console.log(`   Found ${events.length} markets`);
  console.log('');

  if (events.length === 0) {
    console.log('   ℹ️  No markets found. Create a market first!');
    console.log('');
  } else {
    // Check each market
    const now = Math.floor(Date.now() / 1000);
    let readyCount = 0;

    for (const event of events) {
      const questionId = event.args.questionId;
      const question = event.args.question;
      const resolutionTime = event.args.resolutionTime;

      // Get market details
      const market = await publicClient.readContract({
        address: process.env.NEXT_PUBLIC_AIORACLE_ADDRESS,
        abi: AI_ORACLE_ABI,
        functionName: 'getMarket',
        args: [questionId],
      });

      const timeUntilResolution = Number(resolutionTime) - now;
      const hasProposal = market.proposer !== '0x0000000000000000000000000000000000000000';
      const isReady = timeUntilResolution <= 0 && !hasProposal;

      if (isReady) {
        readyCount++;
        console.log(`   🎯 Market ready to resolve:`);
        console.log(`      Question: ${question}`);
        console.log(`      QuestionId: ${questionId}`);
        console.log(`      Resolution time: ${new Date(Number(resolutionTime) * 1000).toLocaleString()}`);
        console.log(`      Status: ${market.status}`);
        console.log('');
      }
    }

    if (readyCount === 0) {
      console.log('   ℹ️  No markets ready to resolve yet');
      console.log('   💡 Markets need to pass their resolution time');
      console.log('');
    } else {
      console.log(`   ✅ Found ${readyCount} market(s) ready to resolve!`);
      console.log('');
    }
  }

  console.log('='.repeat(80));
  console.log('✅ All checks passed!');
  console.log('');
  console.log('🚀 Ready to run AI bot:');
  console.log('   pnpm tsx services/ai-bot.ts         # One-time');
  console.log('   pnpm tsx services/ai-bot.ts --watch # Continuous');
  console.log('');

} catch (error) {
  console.error('');
  console.error('❌ Error:', error.message);
  console.error('');
  process.exit(1);
}
