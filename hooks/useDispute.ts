import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, AI_ORACLE_ABI } from '@/lib/contracts';

export function useDispute() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const disputeResolution = (questionId: string, disputeBond: bigint) => {
    writeContract({
      address: CONTRACTS.AI_ORACLE,
      abi: AI_ORACLE_ABI,
      functionName: 'disputeResolution',
      args: [questionId as `0x${string}`],
      value: disputeBond,
    });
  };

  return {
    disputeResolution,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
}

export function useFinalizeMarket() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const finalizeMarket = (questionId: string) => {
    writeContract({
      address: CONTRACTS.AI_ORACLE,
      abi: AI_ORACLE_ABI,
      functionName: 'finalizeMarket',
      args: [questionId as `0x${string}`],
    });
  };

  return {
    finalizeMarket,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
}

