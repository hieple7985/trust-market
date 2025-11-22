#!/usr/bin/env tsx

/**
 * Test script to find actual RPC block range limit
 * Tests different block ranges to find the maximum allowed
 */

import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';

const RPC_URL = 'https://data-seed-prebsc-1-s1.bnbchain.org:8545';
const CONTRACT_ADDRESS = '0x9f4c64c9dd9B086e31a600E56aBB3095394f1508';
const EVENT_TOPIC = '0x5f15cf7c4bbf2085d2ec739480dcdcd1a5e04aaa772f337c8670c5b5590fd36f'; // MarketCreated

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(RPC_URL),
});

async function testBlockRange(blockRange: number, withFilter: boolean = true): Promise<boolean> {
  try {
    const latestBlock = await publicClient.getBlockNumber();
    const fromBlock = latestBlock - BigInt(blockRange);
    
    console.log(`\n🔍 Testing ${blockRange.toLocaleString()} blocks${withFilter ? ' (with filter)' : ' (no filter)'}...`);
    console.log(`   From: ${fromBlock.toString()}`);
    console.log(`   To: ${latestBlock.toString()}`);
    
    const startTime = Date.now();
    
    const params: any = {
      fromBlock,
      toBlock: latestBlock,
    };
    
    if (withFilter) {
      params.address = CONTRACT_ADDRESS as `0x${string}`;
      params.topics = [EVENT_TOPIC as `0x${string}`];
    }
    
    const logs = await publicClient.getLogs(params);
    
    const duration = Date.now() - startTime;
    
    console.log(`   ✅ SUCCESS! Found ${logs.length} events in ${duration}ms`);
    return true;
  } catch (error: any) {
    const errorMsg = error.details || error.message || 'Unknown error';
    console.log(`   ❌ FAILED: ${errorMsg}`);
    return false;
  }
}

async function findMaxLimit() {
  console.log('🚀 Starting RPC Limit Test');
  console.log('📝 RPC:', RPC_URL);
  console.log('📝 Contract:', CONTRACT_ADDRESS);
  console.log('='.repeat(60));

  // First test with smaller ranges
  const testRanges = [
    10,
    50,
    100,
    200,
    500,
    1000,
    1500,
    2000,
    3000,
    5000,
    10000,
  ];

  let maxWorking = 0;
  let minFailing = Infinity;

  console.log('\n📋 Testing WITH address filter...');
  
  for (const range of testRanges) {
    const success = await testBlockRange(range, true);
    
    if (success) {
      maxWorking = range;
    } else {
      minFailing = Math.min(minFailing, range);
      // Stop testing larger ranges after first failure
      break;
    }
    
    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // If all failed with filter, try without filter
  if (maxWorking === 0) {
    console.log('\n⚠️  All tests with filter failed. Testing WITHOUT filter...');
    
    for (const range of testRanges.slice(0, 5)) { // Test only small ranges
      const success = await testBlockRange(range, false);
      
      if (success) {
        console.log(`   ℹ️  Without filter works up to ${range} blocks`);
        console.log(`   ℹ️  Issue is likely with address/topic filtering, not block range`);
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS:');
  console.log(`   ✅ Max working: ${maxWorking.toLocaleString()} blocks`);
  if (minFailing !== Infinity) {
    console.log(`   ❌ Min failing: ${minFailing.toLocaleString()} blocks`);
    console.log(`   📍 Limit is between ${maxWorking.toLocaleString()} and ${minFailing.toLocaleString()} blocks`);
  }
  
  // Calculate time coverage
  const hours = (maxWorking * 3) / 3600;
  console.log(`   ⏰ Coverage: ~${hours.toFixed(1)} hours`);
  console.log('='.repeat(60));

  // Binary search for exact limit if we found a range
  if (minFailing !== Infinity && minFailing - maxWorking > 100) {
    console.log('\n🔬 Running binary search for exact limit...');
    
    let low = maxWorking;
    let high = minFailing;
    let exactLimit = maxWorking;
    
    while (high - low > 10) {
      const mid = Math.floor((low + high) / 2);
      console.log(`\n   Testing ${mid.toLocaleString()} blocks...`);
      
      const success = await testBlockRange(mid);
      
      if (success) {
        low = mid;
        exactLimit = mid;
      } else {
        high = mid;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 EXACT LIMIT FOUND:');
    console.log(`   Maximum: ${exactLimit.toLocaleString()} blocks`);
    console.log(`   Coverage: ~${((exactLimit * 3) / 3600).toFixed(1)} hours`);
    console.log('='.repeat(60));
  }
}

// Run the test
findMaxLimit().catch(console.error);
