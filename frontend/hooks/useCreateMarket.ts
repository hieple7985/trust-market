import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, AI_ORACLE_ABI } from '@/lib/contracts';

export function useCreateMarket() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createMarket = (
    question: string,
    resolutionTime: bigint,
    livenessPeriod: bigint
  ) => {
    writeContract({
      address: CONTRACTS.AI_ORACLE,
      abi: AI_ORACLE_ABI,
      functionName: 'createMarket',
      args: [question, resolutionTime, livenessPeriod],
    });
  };

  return {
    createMarket,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
}

