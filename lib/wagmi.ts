import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bscTestnet } from 'wagmi/chains';
import { http } from 'wagmi';

// Use public RPC endpoints (no API key required)
// Multiple endpoints for fallback reliability
const bscTestnetCustom = {
  ...bscTestnet,
  rpcUrls: {
    default: {
      http: [
        'https://bsc-testnet-rpc.publicnode.com',
        'https://bsc-testnet.public.blastapi.io',
        'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
      ],
    },
    public: {
      http: [
        'https://bsc-testnet-rpc.publicnode.com',
        'https://bsc-testnet.public.blastapi.io',
        'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
      ],
    },
  },
};

export const config = getDefaultConfig({
  appName: 'TrustMarket',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [bscTestnetCustom],
  transports: {
    [bscTestnet.id]: http('https://bsc-testnet-rpc.publicnode.com'),
  },
  ssr: true,
});

