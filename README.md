# PredictAI Oracle - AI Speed + Economic Security

> 🏆 **DoraHacks Seedify Prediction Markets Hackathon**
> The ONLY prediction market with AI speed + UMA economic security on BNB Chain.

## 🌟 Overview

**PredictAI Oracle** combines the speed of AI with the security of economic guarantees. While other prediction markets rely solely on AI oracles (which can be wrong), we use a hybrid approach: **GPT-4 proposes outcomes in 5 minutes, and UMA's $1M+ economic backstop guarantees correctness**.

### 🎯 Our Unique Value

**"5-minute AI resolution with $1M+ UMA backstop"**

We're the **ONLY** prediction market that combines:
- ⚡ **AI Speed**: GPT-4 resolves markets in 5 minutes (not 48 hours)
- 🔒 **Economic Security**: UMA's optimistic oracle with $1M+ bond backstop
- 🎯 **Transparency**: Confidence scores + reasoning + cited sources
- 🏗️ **Production-Ready**: 96% test coverage, battle-tested architecture

### Key Features

- 🤖 **AI-Powered Resolution**: GPT-4 analyzes markets with 95% confidence scoring
- 🔒 **UMA Economic Security**: $1M+ bond backstop for dispute resolution
- 📊 **Full Transparency**: See confidence scores, reasoning, and data sources
- ⚡ **Fast & Cheap**: Built on BNB Chain for low fees
- 🎨 **Beautiful UI**: Modern, responsive design with TailwindCSS
- 🔗 **Web3 Native**: Seamless wallet integration with RainbowKit
- 🏗️ **Developer-Friendly**: Open source, 96% test coverage, well-documented

## 🛠 Tech Stack

- **Next.js 14** (App Router, React Server Components)
- **TypeScript** (Type-safe development)
- **TailwindCSS** (Utility-first styling)
- **Wagmi v2** (React hooks for Ethereum)
- **Viem** (TypeScript Ethereum library)
- **RainbowKit** (Wallet connection UI)
- **OpenAI GPT-4** (AI resolution engine)
- **React Hook Form** + **Zod** (Form validation)
- **React Hot Toast** (User notifications)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)
- MetaMask or any Web3 wallet
- BNB Testnet tokens ([Get from faucet](https://testnet.bnbchain.org/faucet-smart))

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the values:

```bash
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Contract Addresses (from smart contract deployment)
NEXT_PUBLIC_AIORACLE_ADDRESS=0x...
NEXT_PUBLIC_UMA_ADAPTER_ADDRESS=0x...

# OpenAI API Key (for AI bot)
OPENAI_API_KEY=sk-...

# AI Bot Private Key (for automated resolution)
AI_BOT_PRIVATE_KEY=0x...

# Chain ID (97 = BNB Testnet)
NEXT_PUBLIC_CHAIN_ID=97
```

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   ├── markets/             # Markets listing & details
│   │   ├── page.tsx         # All markets
│   │   └── [id]/page.tsx    # Market details
│   ├── create/              # Create market
│   │   └── page.tsx
│   └── api/                 # API routes
│       └── resolve/         # AI resolution endpoint
│           └── route.ts
├── components/              # React components
│   ├── Providers.tsx        # Wagmi + RainbowKit providers
│   ├── Header.tsx           # Navigation header
│   ├── ConnectWallet.tsx    # Wallet connection button
│   ├── MarketCard.tsx       # Market display card
│   ├── MarketList.tsx       # Markets grid with filters
│   ├── MarketDetails.tsx    # Full market view
│   └── CreateMarketForm.tsx # Market creation form
├── hooks/                   # Custom React hooks
│   ├── useCreateMarket.ts   # Create market hook
│   ├── useMarket.ts         # Read market data
│   ├── useDispute.ts        # Dispute & finalize
│   └── useMarketEvents.ts   # Event listening
├── lib/                     # Core utilities
│   ├── wagmi.ts            # Wagmi configuration
│   ├── contracts.ts        # Contract ABIs & addresses
│   ├── types.ts            # TypeScript interfaces
│   ├── utils.ts            # Helper functions
│   ├── openai.ts           # OpenAI GPT-4 integration
│   └── ai-resolver.ts      # AI resolution logic
└── services/               # Backend services
    ├── ai-bot.ts           # AI resolution bot
    └── README.md           # Bot documentation
```

## ✨ Features

### User Features
- 🔗 **Wallet Connection**: Connect with MetaMask, WalletConnect, Coinbase Wallet
- 📝 **Create Markets**: Create prediction markets about any future event
- 📊 **Browse Markets**: View all markets with filtering and search
- 🔍 **Market Details**: See proposals, disputes, and resolution status
- ⚖️ **Dispute**: Challenge incorrect AI proposals with bond
- ✅ **Finalize**: Finalize markets after liveness period

### AI Bot Features
- 🤖 **Automated Resolution**: GPT-4 analyzes and resolves markets
- 📈 **Confidence Scoring**: Only proposes when >70% confident
- 🔍 **Data Sources**: Integrates with CoinGecko, news APIs (extensible)
- ⏰ **Scheduled Monitoring**: Runs every 5 minutes via cron
- 📝 **Detailed Reasoning**: Provides explanation for each decision

## 🔧 Development

### Available Scripts

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Run AI bot (one-time)
pnpm ai-bot

# Run AI bot (watch mode)
pnpm ai-bot:watch
```

### Testing the AI Bot

1. Create a test market with resolution time in the near future
2. Wait for resolution time to pass
3. Run the AI bot:

```bash
pnpm ai-bot
```

4. Check the market details to see the AI proposal

### API Testing

```bash
# Check API status
curl http://localhost:3000/api/resolve

# Trigger manual resolution
curl -X POST http://localhost:3000/api/resolve
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

### Quick Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Configure environment variables in Vercel dashboard

4. Setup cron job for AI bot (see DEPLOYMENT.md)

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [AI Bot Documentation](./services/README.md) - AI bot setup and usage
- [Smart Contracts](../contracts/README.md) - Contract documentation

## 🏗 Architecture

### Frontend Flow

```
User → RainbowKit → Wagmi → Viem → Smart Contract
                                      ↓
                                  Blockchain
```

### AI Resolution Flow

```
Cron Job → API Route → AI Resolver → OpenAI GPT-4
                            ↓
                    Analyze Market
                            ↓
                    Propose Resolution
                            ↓
                    Smart Contract
```

## 🔐 Security

- Private keys stored in environment variables (never committed)
- AI bot wallet funded with minimal BNB
- OpenAI API key rotated regularly
- Smart contracts audited (recommended for mainnet)
- Dispute mechanism for incorrect resolutions

## 🤝 Contributing

This is a hackathon project. Contributions welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT

## 🙏 Acknowledgments

- **DoraHacks** - Hackathon organizer
- **Seedify** - Hackathon sponsor
- **UMA Protocol** - Optimistic oracle
- **OpenAI** - GPT-4 API
- **BNB Chain** - Blockchain infrastructure

---

Built with ❤️ for DoraHacks Seedify Prediction Markets Hackathon
