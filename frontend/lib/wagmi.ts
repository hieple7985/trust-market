import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bscTestnet } from 'wagmi/chains';
import { http } from 'wagmi';

// Use Ankr RPC with API key (free tier: 500 req/s, higher block limits)
// Fallback to official BNB RPCs if Ankr fails
const bscTestnetCustom = {
  ...bscTestnet,
  rpcUrls: {
    default: {
      http: [
        'https://rpc.ankr.com/bsc_testnet_chapel/5185d61f47a6de0ff1a1ab1e9272c469a1ac95ce99277b2c5253a1a704fe8d5d',
        'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
        'https://data-seed-prebsc-2-s1.bnbchain.org:8545',
      ],
    },
    public: {
      http: [
        'https://rpc.ankr.com/bsc_testnet_chapel/5185d61f47a6de0ff1a1ab1e9272c469a1ac95ce99277b2c5253a1a704fe8d5d',
        'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
        'https://data-seed-prebsc-2-s1.bnbchain.org:8545',
      ],
    },
  },
};

// Clean project ID by removing any whitespace/newlines
const cleanProjectId = (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '').trim();

export const config = getDefaultConfig({
  appName: 'TrustMarket',
  // Use cleaned project ID or fallback to a dummy ID to prevent errors
  projectId: cleanProjectId || 'dummy-project-id-for-testing',
  chains: [bscTestnetCustom],
  transports: {
    [bscTestnet.id]: http(
      process.env.NEXT_PUBLIC_BNB_TESTNET_RPC || 
      'https://data-seed-prebsc-1-s1.bnbchain.org:8545'
    ),
  },
  ssr: true,
});

