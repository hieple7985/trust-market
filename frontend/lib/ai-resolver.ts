import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bscTestnet } from 'viem/chains';
import { analyzeMarketWithAI, gatherDataSources } from './openai';
import { AI_ORACLE_ABI } from './contracts';

// Get contract address at runtime (after env vars are loaded)
const getContractAddress = () => {
  const address = (process.env.NEXT_PUBLIC_AIORACLE_ADDRESS || process.env.AIORACLE_ADDRESS || '').trim();
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    throw new Error('AIORACLE_ADDRESS not configured');
  }
  return address as `0x${string}`;
};

export interface MarketToResolve {
  questionId: string;
  question: string;
  resolutionTime: bigint;
}

export class AIResolver {
  private publicClient;
  private walletClient;
  private account;

  constructor(privateKey: string) {
    // Create account from private key
    this.account = privateKeyToAccount(privateKey as `0x${string}`);

    // Create transport with custom RPC if available
    const transport = http(process.env.NEXT_PUBLIC_BNB_TESTNET_RPC || process.env.BNB_TESTNET_RPC);

    // Create public client for reading
    this.publicClient = createPublicClient({
      chain: bscTestnet,
      transport,
    });

    // Create wallet client for writing
    this.walletClient = createWalletClient({
      account: this.account,
      chain: bscTestnet,
      transport,
    });
  }

  async resolveMarket(market: MarketToResolve): Promise<void> {
    try {
      console.log(`Resolving market: ${market.question}`);

      // Check if resolution time has passed
      const now = Math.floor(Date.now() / 1000);
      if (now < Number(market.resolutionTime)) {
        console.log('Resolution time not reached yet');
        return;
      }

      // Check market status
      const marketData = await this.publicClient.readContract({
        address: getContractAddress(),
        abi: AI_ORACLE_ABI,
        functionName: 'getMarket',
        args: [market.questionId as `0x${string}`],
      }) as any;

      console.log(`Market status: ${marketData.status}`);
      
      // Status: 0 = PENDING, 1 = PROPOSED, 2 = DISPUTED, 3 = FINALIZED
      if (marketData.status !== 0) {
        console.log(`Market not in PENDING status (status: ${marketData.status}), skipping...`);
        return;
      }

      // Gather data sources
      console.log('Gathering data sources...');
      const dataSources = await gatherDataSources(market.question);

      // Analyze with AI
      console.log('Analyzing with GPT-4...');
      const result = await analyzeMarketWithAI(
        market.question,
        new Date(Number(market.resolutionTime) * 1000),
        dataSources
      );

      console.log('AI Analysis Result:', result);

      // Only propose if confidence is high enough
      if (result.confidence < 70) {
        console.log(
          `Confidence too low (${result.confidence}%), skipping proposal`
        );
        return;
      }

      // Submit proposal to contract (sources as array)
      console.log('Submitting proposal to contract...');
      const hash = await this.walletClient.writeContract({
        address: getContractAddress(),
        abi: AI_ORACLE_ABI,
        functionName: 'proposeResolution',
        args: [
          market.questionId as `0x${string}`,
          result.outcome,
          result.reasoning,
          result.sources,
        ],
      });

      console.log('Proposal submitted! Transaction hash:', hash);

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash,
      });

      console.log('Proposal confirmed! Block:', receipt.blockNumber);
    } catch (error) {
      console.error('Error resolving market:', error);
      throw error;
    }
  }

  async monitorAndResolveMarkets(): Promise<void> {
    try {
      console.log('Monitoring markets for resolution...');

      // Get the latest block number to define a reasonable scan range
      const latestBlock = await this.publicClient.getBlockNumber();
      const fromBlock = latestBlock > 200000n ? latestBlock - 200000n : 0n; // Scan last 200k blocks
      console.log(`Scanning for markets from block ${fromBlock} to ${latestBlock}...`);
      console.log(`Contract address: ${getContractAddress()}`);

      // Use getContractEvents like frontend does - scan in batches
      const BATCH_SIZE = 1000n;
      let allLogs = [];
      
      for (let currentBlock = fromBlock; currentBlock <= latestBlock; currentBlock += BATCH_SIZE) {
        const toBlock = currentBlock + BATCH_SIZE - 1n > latestBlock ? latestBlock : currentBlock + BATCH_SIZE - 1n;
        try {
          const batchLogs = await this.publicClient.getContractEvents({
            address: getContractAddress(),
            abi: AI_ORACLE_ABI,
            eventName: 'MarketCreated',
            fromBlock: currentBlock,
            toBlock: toBlock,
          });
          allLogs.push(...batchLogs);
        } catch (e: any) {
          console.warn(`Warning: Failed to get logs for batch ${currentBlock}-${toBlock}:`, e.message);
        }
      }
      
      const logs = allLogs;

      console.log(`Found ${logs.length} markets`);

      // Process each market
      for (const log of logs) {
        const questionId = log.topics[1] as string;
        const args = log.args as any;

        const market: MarketToResolve = {
          questionId,
          question: args.question,
          resolutionTime: args.resolutionTime,
        };

        // Check if market needs resolution
        const now = Math.floor(Date.now() / 1000);
        if (now >= Number(market.resolutionTime)) {
          console.log(`Market ready for resolution: ${market.question}`);
          try {
            await this.resolveMarket(market);
            console.log(`✅ Market resolved successfully: ${market.question}`);
          } catch (error: any) {
            console.error(`❌ Failed to resolve market: ${market.question}`, error.shortMessage || error.message);
            // Continue with next market
          }
        }
      }

      console.log('Monitoring complete');
    } catch (error) {
      console.error('Error monitoring markets:', error);
      throw error;
    }
  }
}

// Helper function to create resolver instance
export function createAIResolver(privateKey?: string): AIResolver {
  const key = privateKey || process.env.AI_BOT_PRIVATE_KEY;
  if (!key) {
    throw new Error('AI_BOT_PRIVATE_KEY not configured');
  }
  return new AIResolver(key);
}

