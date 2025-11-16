import { useReadContract } from 'wagmi';
import { CONTRACTS, AI_ORACLE_ABI } from '@/lib/contracts';
import { Market, Proposal } from '@/lib/types';

export function useMarket(questionId: string) {
  const {
    data: marketData,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: CONTRACTS.AI_ORACLE,
    abi: AI_ORACLE_ABI,
    functionName: 'getMarket',
    args: [questionId as `0x${string}`],
  });

  const market = marketData as Market | undefined;

  return {
    market,
    isLoading,
    error,
    refetch,
  };
}

export function useProposal(questionId: string) {
  const {
    data: proposalData,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: CONTRACTS.AI_ORACLE,
    abi: AI_ORACLE_ABI,
    functionName: 'getProposal',
    args: [questionId as `0x${string}`],
  });

  const proposal = proposalData as Proposal | undefined;

  return {
    proposal,
    isLoading,
    error,
    refetch,
  };
}

export function useDisputeBond() {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACTS.AI_ORACLE,
    abi: AI_ORACLE_ABI,
    functionName: 'disputeBond',
  });

  return {
    disputeBond: data as bigint | undefined,
    isLoading,
    error,
  };
}

