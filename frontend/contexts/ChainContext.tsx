'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useICPAuth } from '@/hooks/useICP';

export type Chain = 'bnb' | 'icp';

interface ChainContextType {
  selectedChain: Chain;
  setSelectedChain: (chain: Chain) => void;
  isConnected: (chain: Chain) => boolean;
  getWalletAddress: (chain: Chain) => string | undefined;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export function ChainProvider({ children }: { children: ReactNode }) {
  const [selectedChain, setSelectedChainState] = useState<Chain>('bnb');
  
  const { address: bnbAddress, isConnected: bnbConnected } = useAccount();
  const { authenticated: icpAuthenticated, principal } = useICPAuth();
  
  useEffect(() => {
    const saved = localStorage.getItem('selectedChain') as Chain;
    if (saved && (saved === 'bnb' || saved === 'icp')) {
      setSelectedChainState(saved);
    }
  }, []);
  
  const setSelectedChain = (chain: Chain) => {
    setSelectedChainState(chain);
    localStorage.setItem('selectedChain', chain);
  };
  
  const isConnected = (chain: Chain): boolean => {
    return chain === 'bnb' ? bnbConnected : icpAuthenticated;
  };
  
  const getWalletAddress = (chain: Chain): string | undefined => {
    if (chain === 'bnb') {
      return bnbAddress;
    } else {
      return principal?.toString();
    }
  };
  
  return (
    <ChainContext.Provider 
      value={{ 
        selectedChain, 
        setSelectedChain, 
        isConnected,
        getWalletAddress
      }}
    >
      {children}
    </ChainContext.Provider>
  );
}

export function useChain() {
  const context = useContext(ChainContext);
  if (context === undefined) {
    throw new Error('useChain must be used within a ChainProvider');
  }
  return context;
}
