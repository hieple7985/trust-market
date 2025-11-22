import { useEffect, useState } from 'react';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import { CONTRACTS, AI_ORACLE_ABI } from '@/lib/contracts';

export interface MarketCreatedEvent {
  questionId: string;
  question: string;
  resolutionTime: bigint;
  livenessPeriod: bigint;
}

export interface ResolutionProposedEvent {
  questionId: string;
  proposedOutcome: boolean;
  reasoning: string;
}

export interface DisputeRaisedEvent {
  questionId: string;
  disputer: string;
}

export interface MarketFinalizedEvent {
  questionId: string;
  outcome: boolean;
}

export function useMarketCreatedEvents() {
  const [events, setEvents] = useState<MarketCreatedEvent[]>([]);

  useWatchContractEvent({
    address: CONTRACTS.AI_ORACLE,
    abi: AI_ORACLE_ABI,
    eventName: 'MarketCreated',
    onLogs(logs) {
      const newEvents = logs.map((log) => ({
        questionId: log.topics[1] as string,
        question: (log.args as any).question,
        resolutionTime: (log.args as any).resolutionTime,
        livenessPeriod: (log.args as any).livenessPeriod,
      }));
      setEvents((prev) => [...prev, ...newEvents]);
    },
  });

  return events;
}

export function useResolutionProposedEvents() {
  const [events, setEvents] = useState<ResolutionProposedEvent[]>([]);

  useWatchContractEvent({
    address: CONTRACTS.AI_ORACLE,
    abi: AI_ORACLE_ABI,
    eventName: 'ResolutionProposed',
    onLogs(logs) {
      const newEvents = logs.map((log) => ({
        questionId: log.topics[1] as string,
        proposedOutcome: (log.args as any).proposedOutcome,
        reasoning: (log.args as any).reasoning,
      }));
      setEvents((prev) => [...prev, ...newEvents]);
    },
  });

  return events;
}

export function useDisputeRaisedEvents() {
  const [events, setEvents] = useState<DisputeRaisedEvent[]>([]);

  useWatchContractEvent({
    address: CONTRACTS.AI_ORACLE,
    abi: AI_ORACLE_ABI,
    eventName: 'DisputeRaised',
    onLogs(logs) {
      const newEvents = logs.map((log) => ({
        questionId: log.topics[1] as string,
        disputer: (log.args as any).disputer,
      }));
      setEvents((prev) => [...prev, ...newEvents]);
    },
  });

  return events;
}

export function useMarketFinalizedEvents() {
  const [events, setEvents] = useState<MarketFinalizedEvent[]>([]);

  useWatchContractEvent({
    address: CONTRACTS.AI_ORACLE,
    abi: AI_ORACLE_ABI,
    eventName: 'MarketFinalized',
    onLogs(logs) {
      const newEvents = logs.map((log) => ({
        questionId: log.topics[1] as string,
        outcome: (log.args as any).outcome,
      }));
      setEvents((prev) => [...prev, ...newEvents]);
    },
  });

  return events;
}

// Hook to get all historical events
export function useMarketHistory(questionId?: string) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient) return;

    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const filter = questionId
          ? { questionId: questionId as `0x${string}` }
          : undefined;

        // Get current block number
        const latestBlock = await publicClient.getBlockNumber();
        // Query last 10,000 blocks (~8 hours on BSC Testnet at 3s/block)
        // Most public RPCs limit to 10k-50k blocks per query
        const fromBlock = latestBlock > 10000n ? latestBlock - 10000n : 0n;

        // Get all events for this market
        const [created, proposed, disputed, finalized] = await Promise.all([
          publicClient.getLogs({
            address: CONTRACTS.AI_ORACLE,
            event: {
              type: 'event',
              name: 'MarketCreated',
              inputs: [
                { type: 'bytes32', indexed: true, name: 'questionId' },
                { type: 'string', indexed: false, name: 'question' },
                { type: 'uint256', indexed: false, name: 'resolutionTime' },
                { type: 'uint256', indexed: false, name: 'livenessPeriod' },
              ],
            },
            fromBlock,
            toBlock: 'latest',
          }),
          publicClient.getLogs({
            address: CONTRACTS.AI_ORACLE,
            event: {
              type: 'event',
              name: 'ResolutionProposed',
              inputs: [
                { type: 'bytes32', indexed: true, name: 'questionId' },
                { type: 'bool', indexed: false, name: 'proposedOutcome' },
                { type: 'string', indexed: false, name: 'reasoning' },
              ],
            },
            fromBlock,
            toBlock: 'latest',
          }),
          publicClient.getLogs({
            address: CONTRACTS.AI_ORACLE,
            event: {
              type: 'event',
              name: 'DisputeRaised',
              inputs: [
                { type: 'bytes32', indexed: true, name: 'questionId' },
                { type: 'address', indexed: false, name: 'disputer' },
              ],
            },
            fromBlock,
            toBlock: 'latest',
          }),
          publicClient.getLogs({
            address: CONTRACTS.AI_ORACLE,
            event: {
              type: 'event',
              name: 'MarketFinalized',
              inputs: [
                { type: 'bytes32', indexed: true, name: 'questionId' },
                { type: 'bool', indexed: false, name: 'outcome' },
              ],
            },
            fromBlock,
            toBlock: 'latest',
          }),
        ]);

        const allEvents = [
          ...created.map((e) => ({ type: 'created', ...e })),
          ...proposed.map((e) => ({ type: 'proposed', ...e })),
          ...disputed.map((e) => ({ type: 'disputed', ...e })),
          ...finalized.map((e) => ({ type: 'finalized', ...e })),
        ];

        // Sort by block number
        allEvents.sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));

        setHistory(allEvents);
      } catch (error) {
        console.error('Error loading market history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [publicClient, questionId]);

  return { history, isLoading };
}

