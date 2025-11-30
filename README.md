# TrustMarket 🎯

**Decentralized Prediction Markets with Multi-Chain Support**

Create and trade on prediction markets across BNB Chain and Internet Computer (ICP).

## 🌐 Live

- **App**: https://trust-market-inky.vercel.app/
- **ICP Candid UI**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=oyleh-yqaaa-aaaau-aczbq-cai

## ⛓️ Supported Chains

| Chain | Network | Status |
|-------|---------|--------|
| **BNB Chain** | Testnet | Live |
| **Internet Computer** | Mainnet | Live |

## ✨ Features

- **Multi-Chain**: Trade on BNB Chain or ICP from one interface
- **Decentralized**: Smart contracts on BNB, Canisters on ICP
- **Easy Login**: MetaMask for BNB, Internet Identity for ICP
- **Low Fees**: Optimized for cost-effective trading

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm

### Run Locally

```bash
cd frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000

## 📁 Project Structure

```
├── frontend/                 # Next.js frontend
│   ├── app/                  # Pages
│   ├── components/           # UI components
│   └── hooks/                # React hooks
├── contracts/                # BNB smart contracts
├── icp-canisters/            # ICP Motoko canisters
└── dfx.json                  # ICP config
```

## 🔧 Configuration

Copy `.env.example` to `.env.local` and fill in:

```env
# BNB Chain
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# ICP (pre-configured)
NEXT_PUBLIC_ICP_BACKEND_CANISTER_ID=oyleh-yqaaa-aaaau-aczbq-cai
NEXT_PUBLIC_IC_HOST=https://icp0.io
```

## 📜 Deployed Contracts

### BNB Testnet
- **AIOracle**: `0x9f4c64c9dd9B086e31a600E56aBB3095394f1508`

### ICP Mainnet
- **Backend**: `oyleh-yqaaa-aaaau-aczbq-cai`

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, Ant Design |
| BNB | Solidity, RainbowKit, wagmi |
| ICP | Motoko, @dfinity/agent |
| Hosting | Vercel |

## 📄 License

MIT

## 🔗 Links

- [BNB Chain](https://www.bnbchain.org/)
- [Internet Computer](https://internetcomputer.org/)
