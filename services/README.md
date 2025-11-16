# AI Bot Service

Automated AI oracle service that monitors and resolves prediction markets using GPT-4.

## Features

- 🤖 Automated market resolution using GPT-4
- 📊 Confidence-based decision making (only proposes when >70% confident)
- 🔍 Data source integration (extensible for CoinGecko, News APIs, etc.)
- ⏰ Scheduled monitoring (watch mode)
- 🔐 Secure wallet integration for on-chain proposals

## Setup

### 1. Environment Variables

Create a `.env.local` file with:

```bash
# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Private key for AI bot wallet (should have BNB for gas)
AI_BOT_PRIVATE_KEY=0x...

# Contract addresses
NEXT_PUBLIC_AIORACLE_ADDRESS=0x...
NEXT_PUBLIC_UMA_ADAPTER_ADDRESS=0x...
```

### 2. Fund the AI Bot Wallet

The AI bot needs BNB for gas fees to submit proposals:

```bash
# Get the bot's address
pnpm tsx -e "import { privateKeyToAccount } from 'viem/accounts'; console.log(privateKeyToAccount('YOUR_PRIVATE_KEY').address)"

# Send BNB to this address on BNB Testnet
```

## Usage

### One-time Resolution

Run the bot once to check and resolve all pending markets:

```bash
pnpm ai-bot
```

### Continuous Monitoring

Run the bot in watch mode (checks every 5 minutes):

```bash
pnpm ai-bot:watch
```

### API Endpoint

You can also trigger resolution via the API:

```bash
# Check status
curl http://localhost:3000/api/resolve

# Trigger resolution
curl -X POST http://localhost:3000/api/resolve
```

## How It Works

1. **Monitor Markets**: Scans all `MarketCreated` events from the AIOracle contract
2. **Check Resolution Time**: Only processes markets where `resolutionTime` has passed
3. **Gather Data**: Collects relevant data sources based on the question
4. **AI Analysis**: Uses GPT-4 to analyze the question and determine the outcome
5. **Confidence Check**: Only proposes if confidence is ≥70%
6. **Submit Proposal**: Calls `proposeResolution()` on the AIOracle contract

## AI Resolution Process

The AI analyzes markets using:

- **Question Analysis**: Understanding what the market is asking
- **Data Sources**: Gathering relevant information (crypto prices, news, events)
- **Reasoning**: Providing detailed explanation for the decision
- **Confidence Score**: Self-assessment of certainty (0-100%)
- **Source Attribution**: Listing sources used for the decision

Example AI response:

```json
{
  "outcome": true,
  "reasoning": "Bitcoin price reached $50,000 on March 15, 2024 at 14:30 UTC according to CoinGecko data. Multiple exchanges confirmed this price level.",
  "confidence": 95,
  "sources": [
    "CoinGecko API - Bitcoin price data",
    "Binance BTC/USDT price feed",
    "CoinMarketCap historical data"
  ]
}
```

## Deployment

### Vercel Cron Job

Deploy as a Vercel Cron Job for automated resolution:

1. Create `vercel.json`:

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

2. Deploy to Vercel:

```bash
vercel --prod
```

### Docker Container

Run as a Docker container:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
CMD ["pnpm", "ai-bot:watch"]
```

### Systemd Service

Run as a systemd service on Linux:

```ini
[Unit]
Description=PredictAI Oracle Bot
After=network.target

[Service]
Type=simple
User=predictai
WorkingDirectory=/opt/frontend
ExecStart=/usr/bin/pnpm ai-bot:watch
Restart=always

[Install]
WantedBy=multi-user.target
```

## Security Considerations

- 🔐 **Private Key**: Never commit the AI bot private key to version control
- 💰 **Funding**: Keep minimal BNB in the bot wallet (only for gas)
- 🔒 **API Keys**: Rotate OpenAI API keys regularly
- 📊 **Monitoring**: Set up alerts for failed resolutions
- 🚨 **Rate Limits**: Be aware of OpenAI API rate limits

## Extending Data Sources

To add new data sources, edit `lib/openai.ts`:

```typescript
export async function gatherDataSources(question: string): Promise<string[]> {
  const sources: string[] = [];

  // Add CoinGecko integration
  if (question.includes('bitcoin')) {
    const price = await fetchBitcoinPrice();
    sources.push(`Bitcoin price: $${price}`);
  }

  // Add news API integration
  const news = await fetchRelevantNews(question);
  sources.push(...news);

  return sources;
}
```

## Troubleshooting

### Bot not resolving markets

- Check that resolution time has passed
- Verify the bot wallet has BNB for gas
- Check OpenAI API key is valid
- Review logs for errors

### Low confidence scores

- Improve the GPT-4 prompt in `lib/openai.ts`
- Add more data sources
- Use GPT-4 Turbo for better analysis

### Transaction failures

- Ensure bot wallet has sufficient BNB
- Check contract address is correct
- Verify network connectivity

## License

MIT

