import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Test script for creating and interacting with a market on testnet
 * 
 * Usage:
 * npx hardhat run scripts/test-market.ts --network bnbTestnet
 */

async function main() {
  console.log("🧪 Testing PredictAI Oracle on testnet...\n");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`👤 Signer: ${signer.address}\n`);

  // Load latest deployment
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const files = fs.readdirSync(deploymentsDir);
  const latestFile = files
    .filter((f) => f.startsWith(network.name))
    .sort()
    .reverse()[0];

  if (!latestFile) {
    throw new Error(`No deployment found for network ${network.name}`);
  }

  const deploymentPath = path.join(deploymentsDir, latestFile);
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  console.log(`📄 Using deployment: ${latestFile}`);
  console.log(`   AIOracle: ${deployment.aiOracle}\n`);

  // Get contract instance
  const aiOracle = await ethers.getContractAt("AIOracle", deployment.aiOracle);

  // Test 1: Create a market
  console.log("=" .repeat(60));
  console.log("TEST 1: Create Market");
  console.log("=" .repeat(60));

  const question = "Will BTC reach $100k by end of 2025?";
  const currentTime = Math.floor(Date.now() / 1000);
  const resolutionTime = currentTime + 3600; // 1 hour from now
  const liveness = 2 * 60 * 60; // 2 hours

  console.log(`Question: ${question}`);
  console.log(`Resolution Time: ${new Date(resolutionTime * 1000).toISOString()}`);
  console.log(`Liveness: ${liveness / 3600} hours\n`);

  console.log("📝 Creating market...");
  const tx1 = await aiOracle.createMarket(question, resolutionTime, liveness);
  console.log(`   Transaction: ${tx1.hash}`);
  const receipt1 = await tx1.wait();
  console.log(`   ✅ Market created! Gas used: ${receipt1?.gasUsed.toString()}\n`);

  // Extract questionId from event
  const event = receipt1?.logs.find(
    (log: any) => {
      try {
        const parsed = aiOracle.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        return parsed?.name === "MarketCreated";
      } catch {
        return false;
      }
    }
  );

  let questionId: string;
  if (event) {
    const parsed = aiOracle.interface.parseLog({
      topics: event.topics as string[],
      data: event.data,
    });
    questionId = parsed?.args[0];
    console.log(`   Question ID: ${questionId}\n`);
  } else {
    throw new Error("MarketCreated event not found");
  }

  // Test 2: Get market details
  console.log("=" .repeat(60));
  console.log("TEST 2: Get Market Details");
  console.log("=" .repeat(60));

  const market = await aiOracle.getMarket(questionId);
  console.log(`Question: ${market.question}`);
  console.log(`Resolution Time: ${new Date(Number(market.resolutionTime) * 1000).toISOString()}`);
  console.log(`Status: ${["PENDING", "PROPOSED", "DISPUTED", "RESOLVED"][market.status]}`);
  console.log(`Outcome: ${market.outcome ? "YES" : "NO"}`);
  console.log();

  // Test 3: Try to propose (will fail if not resolution time yet)
  console.log("=" .repeat(60));
  console.log("TEST 3: Propose Resolution (Expected to fail - too early)");
  console.log("=" .repeat(60));

  try {
    await aiOracle.proposeResolution(
      questionId,
      true,
      "Based on market analysis",
      ["CoinGecko", "CoinMarketCap"]
    );
    console.log("❌ Unexpected: Proposal succeeded (should have failed)\n");
  } catch (error: any) {
    if (error.message.includes("ResolutionTimeNotReached")) {
      console.log("✅ Expected error: ResolutionTimeNotReached");
      console.log("   (This is correct - resolution time not reached yet)\n");
    } else {
      console.log(`⚠️  Unexpected error: ${error.message}\n`);
    }
  }

  // Test 4: Check contract state
  console.log("=" .repeat(60));
  console.log("TEST 4: Contract Configuration");
  console.log("=" .repeat(60));

  const aiBot = await aiOracle.aiBot();
  const disputeBond = await aiOracle.disputeBond();
  const defaultLiveness = await aiOracle.DEFAULT_LIVENESS();

  console.log(`AI Bot: ${aiBot}`);
  console.log(`Dispute Bond: ${ethers.formatEther(disputeBond)} BNB`);
  console.log(`Default Liveness: ${Number(defaultLiveness) / 3600} hours`);
  console.log();

  // Summary
  console.log("=" .repeat(60));
  console.log("🎉 TESTS COMPLETE!");
  console.log("=" .repeat(60));
  console.log(`Market Created: ${questionId}`);
  console.log(`Status: PENDING`);
  console.log(`\nTo continue testing:`);
  console.log(`1. Wait until ${new Date(resolutionTime * 1000).toISOString()}`);
  console.log(`2. Run propose-resolution.ts script`);
  console.log(`3. Test dispute mechanism`);
  console.log(`4. Finalize market after liveness period\n`);

  // Save test results
  const testResults = {
    timestamp: new Date().toISOString(),
    network: network.name,
    questionId,
    question,
    resolutionTime: new Date(resolutionTime * 1000).toISOString(),
    status: "PENDING",
    contractAddress: deployment.aiOracle,
  };

  const testResultsPath = path.join(deploymentsDir, `test-results-${Date.now()}.json`);
  fs.writeFileSync(testResultsPath, JSON.stringify(testResults, null, 2));
  console.log(`💾 Test results saved to: ${path.basename(testResultsPath)}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:");
    console.error(error);
    process.exit(1);
  });

