import { ethers } from "hardhat";

/**
 * Check wallet balance before deployment
 * 
 * Usage:
 * npx hardhat run scripts/check-balance.ts --network bnbTestnet
 */

async function main() {
  console.log("🔍 Checking wallet balance...\n");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  const network = await ethers.provider.getNetwork();

  console.log("📡 Network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("👤 Wallet:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "BNB\n");

  // Check if balance is sufficient
  const minBalance = ethers.parseEther("0.1"); // 0.1 BNB minimum
  if (balance < minBalance) {
    console.log("⚠️  WARNING: Balance is low!");
    console.log("   Recommended: At least 0.1 BNB for deployment");
    console.log("   Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart\n");
  } else {
    console.log("✅ Balance is sufficient for deployment\n");
  }

  // Estimate deployment cost
  console.log("📊 Estimated Deployment Costs:");
  console.log("   AIOracle: ~0.01-0.02 BNB");
  console.log("   Verification: Free");
  console.log("   Total: ~0.02 BNB\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

