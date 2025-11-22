import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Test deployed contract on testnet
 * 
 * Usage:
 * npx hardhat run scripts/test-deployed.ts --network bnbTestnet
 */

async function main() {
  console.log("🧪 Testing deployed contract...\n");

  // Get latest deployment
  const deploymentsDir = path.join(__dirname, "../deployments");
  const files = fs.readdirSync(deploymentsDir)
    .filter(f => f.startsWith("bnbTestnet-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error("❌ No deployment found!");
    console.error("   Run: pnpm deploy:testnet first\n");
    process.exit(1);
  }

  const latestDeployment = JSON.parse(
    fs.readFileSync(path.join(deploymentsDir, files[0]), "utf-8")
  );

  console.log("📋 Using deployment:", files[0]);
  console.log("📝 AIOracle:", latestDeployment.aiOracle);
  console.log("🤖 AI Bot:", latestDeployment.aiBot);
  console.log("💰 Dispute Bond:", latestDeployment.disputeBond, "BNB\n");

  // Get contract instance
  const aiOracle = await ethers.getContractAt(
    "AIOracle",
    latestDeployment.aiOracle
  );

  // Test 1: Read contract state
  console.log("TEST 1: Read Contract State");
  console.log("=" .repeat(50));
  
  const aiBot = await aiOracle.aiBot();
  const disputeBond = await aiOracle.disputeBond();
  
  console.log("✅ AI Bot:", aiBot);
  console.log("✅ Dispute Bond:", ethers.formatEther(disputeBond), "BNB\n");

  // Test 2: Create a test market
  console.log("TEST 2: Create Test Market");
  console.log("=" .repeat(50));

  const question = "Will BTC reach $100k by end of 2025?";
  const resolutionTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const liveness = 7200; // 2 hours

  console.log("Question:", question);
  console.log("Resolution Time:", new Date(resolutionTime * 1000).toISOString());
  console.log("Liveness:", liveness / 3600, "hours");

  try {
    const tx = await aiOracle.createMarket(question, resolutionTime, liveness);
    console.log("📤 Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("   Gas used:", receipt?.gasUsed.toString());
    console.log("   Block:", receipt?.blockNumber);

    // Get question ID from event
    const event = receipt?.logs.find((log: any) => {
      try {
        const parsed = aiOracle.interface.parseLog(log);
        return parsed?.name === "MarketCreated";
      } catch {
        return false;
      }
    });

    if (event) {
      const parsed = aiOracle.interface.parseLog(event);
      const questionId = parsed?.args[0];
      console.log("   Question ID:", questionId);
      console.log("\n✅ Market created successfully!\n");

      // Test 3: Read market details
      console.log("TEST 3: Read Market Details");
      console.log("=" .repeat(50));

      const market = await aiOracle.markets(questionId);
      console.log("Question:", market.question);
      console.log("Creator:", market.creator);
      console.log("Resolution Time:", new Date(Number(market.resolutionTime) * 1000).toISOString());
      console.log("Status:", market.resolved ? "Resolved" : "Pending");
      console.log("\n✅ Can read market details!\n");
    }
  } catch (error: any) {
    console.error("❌ Error creating market:", error.message);
    console.error("\nPossible issues:");
    console.error("- Insufficient BNB for gas");
    console.error("- Contract not deployed correctly");
    console.error("- Network connection issues\n");
  }

  // Summary
  console.log("=" .repeat(50));
  console.log("🎉 TESTING COMPLETE!\n");
  console.log("Next steps:");
  console.log("1. View contract on BSCScan:");
  console.log(`   https://testnet.bscscan.com/address/${latestDeployment.aiOracle}`);
  console.log("2. Update frontend with contract address");
  console.log("3. Test AI bot resolution\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

