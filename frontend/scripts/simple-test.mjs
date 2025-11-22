#!/usr/bin/env node

import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';

const RPC_URL = 'https://data-seed-prebsc-1-s1.bnbchain.org:8545';
const CONTRACT_ADDRESS = '0x9f4c64c9dd9B086e31a600E56aBB3095394f1508';

console.log('🚀 Testing RPC Limits...\n');

const client = createPublicClient({
  chain: bscTestnet,
  transport: http(RPC_URL),
});

async function test() {
  try {
    console.log('Getting latest block...');
    const latest = await client.getBlockNumber();
    console.log(`Latest block: ${latest}\n`);
    
    const ranges = [10, 50, 100, 500, 1000, 2000, 5000];
    
    for (const range of ranges) {
      const from = latest - BigInt(range);
      console.log(`Testing ${range} blocks (${from} to ${latest})...`);
      
      try {
        const start = Date.now();
        const logs = await client.getLogs({
          address: CONTRACT_ADDRESS,
          fromBlock: from,
          toBlock: latest,
        });
        const duration = Date.now() - start;
        console.log(`  ✅ SUCCESS! ${logs.length} events in ${duration}ms\n`);
      } catch (err) {
        console.log(`  ❌ FAILED: ${err.details || err.message}\n`);
        break;
      }
      
      await new Promise(r => setTimeout(r, 500));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
