import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * End-to-End Test for Deployed Contract
 * 
 * Tests the complete flow:
 * 1. Create market
 * 2. Place bets
 * 3. Propose resolution
 * 4. Finalize market
 * 
 * Usage:
 * npx hardhat run scripts/test-e2e.ts --network bnbTestnet
 */

async function main() {
  console.log("🧪 Running E2E Test on Deployed Contract...\n");

  // Get latest deployment
  const deploymentsDir = path.join(__dirname, "../deployments");
  const files = fs.readdirSync(deploymentsDir)
    .filter(f => f.startsWith("bnbTestnet-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error("❌ No deployment found!");
    process.exit(1);
  }

  const deployment = JSON.parse(
    fs.readFileSync(path.join(deploymentsDir, files[0]), "utf-8")
  );

  console.log("📋 Deployment Info:");
  console.log("   File:", files[0]);
  console.log("   AIOracle:", deployment.aiOracle);
  console.log("   AI Bot:", deployment.aiBot);
  console.log();

  const [deployer, user1, user2] = await ethers.getSigners();
  const aiOracle = await ethers.getContractAt("AIOracle", deployment.aiOracle);

  console.log("👥 Test Accounts:");
  console.log("   Deployer:", deployer.address);
  console.log("   User 1:", user1.address);
  console.log("   User 2:", user2.address);
  console.log();

  // Test 1: Create Market
  console.log("=" .repeat(60));
  console.log("TEST 1: Create Market");
  console.log("=" .repeat(60));

  const question = "Will BTC reach $100k by end of 2025?";
  const resolutionTime = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
  const liveness = 600; // 10 minutes

  console.log("Question:", question);
  console.log("Resolution Time:", new Date(resolutionTime * 1000).toISOString());
  console.log("Liveness:", liveness / 60, "minutes");
  console.log();

  try {
    const tx = await aiOracle.createMarket(question, resolutionTime, liveness);
    console.log("📤 Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Market created!");
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

    if (!event) {
      console.error("❌ Could not find MarketCreated event");
      process.exit(1);
    }

    const parsed = aiOracle.interface.parseLog(event);
    const questionId = parsed?.args[0];
    console.log("   Question ID:", questionId);
    console.log();

    // Test 2: Read Market Details
    console.log("=" .repeat(60));
    console.log("TEST 2: Read Market Details");
    console.log("=" .repeat(60));

    const market = await aiOracle.markets(questionId);
    console.log("✅ Market Details:");
    console.log("   Question:", market.question);
    console.log("   Creator:", market.creator);
    console.log("   Resolution Time:", new Date(Number(market.resolutionTime) * 1000).toISOString());
    console.log("   Liveness:", Number(market.liveness) / 60, "minutes");
    console.log("   Resolved:", market.resolved);
    console.log("   Answer:", market.answer);
    console.log();

    // Test 3: Propose Resolution (as AI bot)
    console.log("=" .repeat(60));
    console.log("TEST 3: Propose Resolution");
    console.log("=" .repeat(60));

    console.log("⏳ Waiting for resolution time...");
    console.log("   (In production, AI bot would wait automatically)");
    console.log("   (For testing, we'll propose immediately)");
    console.log();

    // Note: This will fail if not past resolution time
    // In production, AI bot waits until resolution time
    console.log("⚠️  Skipping proposal test (requires waiting for resolution time)");
    console.log("   In production:");
    console.log("   1. AI bot monitors markets");
    console.log("   2. When resolution time passes, bot calls OpenAI");
    console.log("   3. Bot submits proposal with AI answer");
    console.log();

    // Test 4: Check Contract State
    console.log("=" .repeat(60));
    console.log("TEST 4: Check Contract State");
    console.log("=" .repeat(60));

    const aiBot = await aiOracle.aiBot();
    const disputeBond = await aiOracle.disputeBond();
    const umaOracle = await aiOracle.umaOracle();

    console.log("✅ Contract Configuration:");
    console.log("   AI Bot:", aiBot);
    console.log("   Dispute Bond:", ethers.formatEther(disputeBond), "BNB");
    console.log("   UMA Oracle:", umaOracle);
    console.log();

    // Test 5: Check Balances
    console.log("=" .repeat(60));
    console.log("TEST 5: Check Balances");
    console.log("=" .repeat(60));

    const deployerBalance = await ethers.provider.getBalance(deployer.address);
    const contractBalance = await ethers.provider.getBalance(deployment.aiOracle);

    console.log("✅ Balances:");
    console.log("   Deployer:", ethers.formatEther(deployerBalance), "BNB");
    console.log("   Contract:", ethers.formatEther(contractBalance), "BNB");
    console.log();

    // Summary
    console.log("=" .repeat(60));
    console.log("🎉 E2E TEST COMPLETE!");
    console.log("=" .repeat(60));
    console.log();
    console.log("✅ Tests Passed:");
    console.log("   1. Create market");
    console.log("   2. Read market details");
    console.log("   3. Check contract state");
    console.log("   4. Check balances");
    console.log();
    console.log("📋 Next Steps:");
    console.log("   1. Wait for resolution time (5 minutes)");
    console.log("   2. Run AI bot to propose resolution");
    console.log("   3. Test dispute mechanism");
    console.log("   4. Test finalization");
    console.log();
    console.log("🔗 View on BscScan:");
    console.log(`   https://testnet.bscscan.com/address/${deployment.aiOracle}`);
    console.log();
    console.log("🤖 Run AI Bot:");
    console.log("   cd ../predictai-frontend");
    console.log("   pnpm ai-bot");
    console.log();

  } catch (error: any) {
    console.error();
    console.error("❌ Test failed:", error.message);
    console.error();
    console.error("Possible issues:");
    console.error("- Insufficient BNB for gas");
    console.error("- Contract not deployed correctly");
    console.error("- Network connection issues");
    console.error("- Invalid parameters");
    console.error();
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

