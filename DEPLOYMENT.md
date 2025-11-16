# Deployment Guide

Complete guide for deploying PredictAI Oracle to production.

## Prerequisites

- [x] Smart contracts deployed to BNB Testnet
- [x] OpenAI API key
- [x] WalletConnect Project ID
- [x] Vercel account (for frontend)
- [x] AI bot wallet with BNB for gas

## Step 1: Deploy Smart Contracts

### 1.1 Deploy to BNB Testnet

```bash
cd ../contracts

# Make sure you have BNB testnet tokens
# Get from: https://testnet.bnbchain.org/faucet-smart

# Deploy contracts
pnpm hardhat run scripts/deploy.ts --network bscTestnet

# Save the contract addresses:
# - AIOracle: 0x...
# - UMAAdapter: 0x...
```

### 1.2 Verify Contracts

```bash
# Verify AIOracle
pnpm hardhat verify --network bscTestnet <AIORACLE_ADDRESS> <UMA_ADAPTER_ADDRESS>

# Verify UMAAdapter
pnpm hardhat verify --network bscTestnet <UMA_ADAPTER_ADDRESS> <OPTIMISTIC_ORACLE_ADDRESS>
```

## Step 2: Configure Environment Variables

### 2.1 Create `.env.local`

```bash
# Copy example
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### 2.2 Required Variables

```bash
# WalletConnect (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Contract Addresses (from Step 1)
NEXT_PUBLIC_AIORACLE_ADDRESS=0x...
NEXT_PUBLIC_UMA_ADAPTER_ADDRESS=0x...

# OpenAI API Key (get from https://platform.openai.com/)
OPENAI_API_KEY=sk-...

# AI Bot Private Key (create new wallet for security)
AI_BOT_PRIVATE_KEY=0x...

# Chain ID (97 for BNB Testnet)
NEXT_PUBLIC_CHAIN_ID=97
```

## Step 3: Test Locally

### 3.1 Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000 and test:
- ✅ Wallet connection
- ✅ Create market
- ✅ View markets
- ✅ Market details

### 3.2 Test AI Bot

```bash
# One-time test
pnpm ai-bot

# Watch mode (Ctrl+C to stop)
pnpm ai-bot:watch
```

### 3.3 Test API Endpoint

```bash
# Start dev server
pnpm dev

# In another terminal, test API
curl http://localhost:3000/api/resolve

# Trigger resolution
curl -X POST http://localhost:3000/api/resolve
```

## Step 4: Deploy to Vercel

### 4.1 Install Vercel CLI

```bash
npm i -g vercel
```

### 4.2 Login to Vercel

```bash
vercel login
```

### 4.3 Deploy

```bash
# First deployment (will ask questions)
vercel

# Production deployment
vercel --prod
```

### 4.4 Configure Environment Variables in Vercel

Go to your project settings on Vercel:

1. Navigate to **Settings** → **Environment Variables**
2. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_AIORACLE_ADDRESS`
   - `NEXT_PUBLIC_UMA_ADAPTER_ADDRESS`
   - `OPENAI_API_KEY`
   - `AI_BOT_PRIVATE_KEY`
   - `NEXT_PUBLIC_CHAIN_ID`

3. Make sure to set them for **Production**, **Preview**, and **Development**

### 4.5 Setup Cron Job for AI Bot

Create `vercel.json` in the project root:

```json
{
  "crons": [
    {
      "path": "/api/resolve",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Redeploy:

```bash
vercel --prod
```

## Step 5: Fund AI Bot Wallet

### 5.1 Get Bot Address

```bash
pnpm tsx -e "import { privateKeyToAccount } from 'viem/accounts'; console.log(privateKeyToAccount('YOUR_PRIVATE_KEY').address)"
```

### 5.2 Send BNB

Send 0.1 BNB to the bot address on BNB Testnet:
- Use MetaMask or any wallet
- Network: BNB Smart Chain Testnet
- Amount: 0.1 BNB (for gas fees)

Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart

## Step 6: Verify Deployment

### 6.1 Check Frontend

Visit your Vercel URL and verify:
- ✅ Page loads correctly
- ✅ Wallet connects
- ✅ Can create markets
- ✅ Markets display correctly
- ✅ Contract interactions work

### 6.2 Check AI Bot

Monitor Vercel logs:

```bash
vercel logs --follow
```

Or check in Vercel dashboard:
- Go to **Deployments** → **Functions**
- Check `/api/resolve` logs

### 6.3 Create Test Market

1. Connect wallet
2. Create a test market:
   - Question: "Will Bitcoin be above $50,000 on [tomorrow's date]?"
   - Resolution time: Tomorrow
   - Liveness period: 1 hour

3. Wait for resolution time
4. Check if AI bot proposes resolution
5. Verify proposal in market details

## Step 7: Monitor & Maintain

### 7.1 Setup Monitoring

- **Vercel Analytics**: Enable in project settings
- **Error Tracking**: Consider Sentry integration
- **Uptime Monitoring**: Use UptimeRobot or similar

### 7.2 Monitor AI Bot

Check regularly:
- Bot wallet balance (should have BNB for gas)
- OpenAI API usage and costs
- Failed resolutions in logs

### 7.3 Rotate Keys

For security:
- Rotate OpenAI API key monthly
- Keep AI bot wallet funded but with minimal balance
- Never commit private keys to git

## Troubleshooting

### Frontend not loading

- Check environment variables in Vercel
- Verify contract addresses are correct
- Check browser console for errors

### Wallet connection fails

- Verify WalletConnect Project ID
- Check network configuration (BNB Testnet)
- Clear browser cache

### AI bot not resolving

- Check bot wallet has BNB
- Verify OpenAI API key is valid
- Check Vercel function logs
- Ensure cron job is configured

### Transactions failing

- Check wallet has BNB for gas
- Verify contract addresses
- Check network (should be BNB Testnet)

## Production Checklist

Before going to mainnet:

- [ ] Audit smart contracts
- [ ] Test all features on testnet
- [ ] Setup monitoring and alerts
- [ ] Prepare incident response plan
- [ ] Document all processes
- [ ] Setup backup AI bot (redundancy)
- [ ] Configure rate limiting
- [ ] Setup proper error handling
- [ ] Test disaster recovery
- [ ] Get legal review (if needed)

## Costs Estimation

### Monthly Costs (Testnet)

- **Vercel**: Free tier (Hobby plan)
- **OpenAI API**: ~$10-50 (depends on usage)
- **BNB Gas**: ~$5-10 (testnet is free)
- **WalletConnect**: Free

### Monthly Costs (Mainnet)

- **Vercel**: $20 (Pro plan recommended)
- **OpenAI API**: ~$50-200 (depends on volume)
- **BNB Gas**: ~$50-200 (depends on activity)
- **WalletConnect**: Free
- **Total**: ~$120-420/month

## Support

For issues:
1. Check logs in Vercel dashboard
2. Review contract events on BscScan
3. Test locally with `pnpm dev`
4. Check AI bot logs with `pnpm ai-bot`

## Next Steps

After successful deployment:
1. Create demo markets
2. Share with community
3. Gather feedback
4. Iterate on features
5. Plan mainnet launch

