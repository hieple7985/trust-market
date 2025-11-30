import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './declarations/icp_backend';
import { analyzeMarketWithAI, gatherDataSources } from './openai';

const CANISTER_ID = process.env.NEXT_PUBLIC_ICP_BACKEND_CANISTER_ID || 'oyleh-yqaaa-aaaau-aczbq-cai';
const IC_HOST = process.env.NEXT_PUBLIC_IC_HOST || 'https://icp0.io';

export interface ICPMarket {
  id: string;
  question: string;
  description: string;
  resolutionTime: bigint;
  status: { Pending: null } | { Proposed: null } | { Finalized: null };
  totalYes: bigint;
  totalNo: bigint;
  outcome: [] | [boolean];
  reasoning: [] | [string];
}

export class ICPResolver {
  private agent: HttpAgent;
  private actor: any;

  constructor() {
    this.agent = new HttpAgent({ host: IC_HOST });
    this.actor = Actor.createActor(idlFactory, {
      agent: this.agent,
      canisterId: CANISTER_ID,
    });
  }

  async resolveMarket(market: ICPMarket): Promise<boolean> {
    try {
      console.log(`[ICP] Resolving market: ${market.question}`);

      const now = Date.now() * 1_000_000;
      if (now < Number(market.resolutionTime)) {
        console.log('[ICP] Resolution time not reached yet');
        return false;
      }

      if (!('Pending' in market.status)) {
        console.log(`[ICP] Market not in Pending status, skipping...`);
        return false;
      }

      console.log('[ICP] Gathering data sources...');
      const dataSources = await gatherDataSources(market.question);

      console.log('[ICP] Analyzing with GPT-4...');
      const result = await analyzeMarketWithAI(
        market.question,
        new Date(Number(market.resolutionTime) / 1_000_000),
        dataSources
      );

      console.log('[ICP] AI Analysis Result:', result);

      if (result.confidence < 70) {
        console.log(`[ICP] Confidence too low (${result.confidence}%), skipping`);
        return false;
      }

      console.log('[ICP] Proposing resolution...');
      const proposeSuccess = await this.actor.proposeResolution(
        market.id,
        result.outcome,
        result.reasoning
      );

      if (!proposeSuccess) {
        console.log('[ICP] Failed to propose resolution');
        return false;
      }

      console.log('[ICP] Finalizing market...');
      const finalizeSuccess = await this.actor.finalizeMarket(market.id);

      if (finalizeSuccess) {
        console.log(`[ICP] ✅ Market resolved successfully: ${market.question}`);
        return true;
      } else {
        console.log('[ICP] Failed to finalize market');
        return false;
      }
    } catch (error) {
      console.error('[ICP] Error resolving market:', error);
      return false;
    }
  }

  async monitorAndResolveMarkets(): Promise<{ resolved: number; total: number }> {
    try {
      console.log('[ICP] Monitoring markets for resolution...');

      const markets: ICPMarket[] = await this.actor.getAllMarkets();
      console.log(`[ICP] Found ${markets.length} markets`);

      let resolved = 0;
      const now = Date.now() * 1_000_000;

      for (const market of markets) {
        if (!market.question || market.question.trim() === '') {
          continue;
        }

        if ('Pending' in market.status && now >= Number(market.resolutionTime)) {
          console.log(`[ICP] Market ready for resolution: ${market.question}`);
          const success = await this.resolveMarket(market);
          if (success) resolved++;
        }
      }

      console.log(`[ICP] Monitoring complete. Resolved ${resolved}/${markets.length} markets`);
      return { resolved, total: markets.length };
    } catch (error) {
      console.error('[ICP] Error monitoring markets:', error);
      throw error;
    }
  }
}

export function createICPResolver(): ICPResolver {
  return new ICPResolver();
}
