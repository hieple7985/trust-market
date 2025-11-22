import { ethers } from "ethers";

/**
 * Generate a new wallet for deployment or AI bot
 * 
 * Usage:
 * npx hardhat run scripts/generate-wallet.ts
 * 
 * ⚠️ SECURITY WARNING:
 * - Only use generated wallets for testnet
 * - Never use on mainnet with real funds
 * - Keep private keys secure
 * - Never commit to git
 */

async function main() {
  console.log("🔐 Generating new wallet...\n");

  // Generate random wallet
  const wallet = ethers.Wallet.createRandom();

  console.log("=" .repeat(60));
  console.log("✅ WALLET GENERATED");
  console.log("=" .repeat(60));
  console.log();
  console.log("📝 Address:");
  console.log(wallet.address);
  console.log();
  console.log("🔑 Private Key:");
  console.log(wallet.privateKey);
  console.log();
  console.log("🔑 Private Key (without 0x):");
  console.log(wallet.privateKey.slice(2));
  console.log();
  console.log("🌱 Mnemonic:");
  console.log(wallet.mnemonic?.phrase || "N/A");
  console.log();
  console.log("=" .repeat(60));
  console.log();

  console.log("⚠️  SECURITY WARNINGS:");
  console.log("1. Save this information securely");
  console.log("2. Never share your private key");
  console.log("3. Never commit to git");
  console.log("4. Only use for testnet");
  console.log("5. Delete after hackathon");
  console.log();

  console.log("📋 NEXT STEPS:");
  console.log("1. Save private key to .env file");
  console.log("2. Add BNB Testnet to MetaMask");
  console.log("3. Import wallet to MetaMask (optional)");
  console.log("4. Get testnet BNB from faucet:");
  console.log("   https://testnet.bnbchain.org/faucet-smart");
  console.log();

  console.log("💡 TIP: Generate 2 wallets:");
  console.log("   - Wallet 1: Deployer (for contract deployment)");
  console.log("   - Wallet 2: AI Bot (for automated resolution)");
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

