import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(process.env.NEXT_PUBLIC_BNB_TESTNET_RPC),
});

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

console.log('🔍 Checking Markets Status\n');
console.log('='.repeat(80));
console.log('');

try {
  const latestBlock = await publicClient.getBlockNumber();
  console.log(`📦 Latest block: ${latestBlock}`);
  console.log('');

  // Get events
  const fromBlock = latestBlock - 200000n;
  const events = await publicClient.getContractEvents({
    address: process.env.NEXT_PUBLIC_AIORACLE_ADDRESS,
    abi: AI_ORACLE_ABI,
    eventName: 'MarketCreated',
    fromBlock,
    toBlock: latestBlock,
  });

  console.log(`📊 Found ${events.length} markets\n`);

  if (events.length === 0) {
    console.log('❌ No markets found!');
    console.log('💡 Create a market first at /create');
    process.exit(0);
  }

  const now = Math.floor(Date.now() / 1000);
  let readyCount = 0;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const questionId = event.args.questionId;
    const question = event.args.question;
    const resolutionTime = event.args.resolutionTime;

    console.log(`\n📝 Market ${i + 1}:`);
    console.log(`   Question: ${question}`);
    console.log(`   QuestionId: ${questionId}`);

    // Get full market data
    const market = await publicClient.readContract({
      address: process.env.NEXT_PUBLIC_AIORACLE_ADDRESS,
      abi: AI_ORACLE_ABI,
      functionName: 'getMarket',
      args: [questionId],
    });

    const resolutionDate = new Date(Number(resolutionTime) * 1000);
    const timeUntilResolution = Number(resolutionTime) - now;
    const hasProposal = market.proposer !== '0x0000000000000000000000000000000000000000';
    
    const statusMap = ['PENDING', 'PROPOSED', 'DISPUTED', 'FINALIZED'];
    const status = statusMap[market.status] || 'UNKNOWN';

    console.log(`   Resolution Time: ${resolutionDate.toLocaleString()}`);
    console.log(`   Status: ${status}`);
    console.log(`   Has Proposal: ${hasProposal ? 'Yes' : 'No'}`);

    if (timeUntilResolution > 0) {
      const hours = Math.floor(timeUntilResolution / 3600);
      const minutes = Math.floor((timeUntilResolution % 3600) / 60);
      console.log(`   ⏰ Time until resolution: ${hours}h ${minutes}m`);
      console.log(`   ❌ NOT READY (resolution time not reached)`);
    } else {
      const hoursAgo = Math.floor(Math.abs(timeUntilResolution) / 3600);
      const minutesAgo = Math.floor((Math.abs(timeUntilResolution) % 3600) / 60);
      console.log(`   ⏰ Resolution time passed: ${hoursAgo}h ${minutesAgo}m ago`);
      
      if (hasProposal) {
        console.log(`   ℹ️  Already has proposal`);
        if (market.proposer) {
          console.log(`   Proposer: ${market.proposer}`);
          console.log(`   Outcome: ${market.outcome ? 'TRUE' : 'FALSE'}`);
          if (market.reasoning) {
            console.log(`   Reasoning: ${market.reasoning.substring(0, 100)}...`);
          }
        }
      } else {
        console.log(`   ✅ READY FOR AI RESOLUTION!`);
        readyCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Summary:`);
  console.log(`   Total markets: ${events.length}`);
  console.log(`   Ready for AI resolution: ${readyCount}`);
  
  if (readyCount > 0) {
    console.log('\n🤖 Run AI bot to resolve:');
    console.log('   pnpm tsx services/ai-bot.ts');
  } else {
    console.log('\n💡 No markets ready for resolution yet');
    console.log('   - Wait for resolution time to pass');
    console.log('   - Or create a market with shorter resolution time for testing');
  }
  console.log('');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error(error);
  process.exit(1);
}
