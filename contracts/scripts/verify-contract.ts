import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Verify deployed contract on BscScan
 * 
 * Usage:
 * npx hardhat run scripts/verify-contract.ts --network bnbTestnet
 */

async function main() {
  console.log("🔍 Verifying contract on BscScan...\n");

  // Get latest deployment
  const deploymentsDir = path.join(__dirname, "../deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    console.error("❌ No deployments directory found!");
    console.error("   Run deployment first: pnpm deploy:testnet\n");
    process.exit(1);
  }

  const files = fs.readdirSync(deploymentsDir)
    .filter(f => f.startsWith("bnbTestnet-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error("❌ No deployment found!");
    console.error("   Run deployment first: pnpm deploy:testnet\n");
    process.exit(1);
  }

  const latestDeployment = JSON.parse(
    fs.readFileSync(path.join(deploymentsDir, files[0]), "utf-8")
  );

  console.log("📋 Using deployment:", files[0]);
  console.log("📝 AIOracle:", latestDeployment.aiOracle);
  console.log();

  // Verify AIOracle
  console.log("🔍 Verifying AIOracle contract...");
  console.log("=" .repeat(60));

  try {
    await run("verify:verify", {
      address: latestDeployment.aiOracle,
      constructorArguments: [
        latestDeployment.aiBot,
        latestDeployment.disputeBond,
        "0x0000000000000000000000000000000000000000", // UMA Oracle (disabled)
      ],
    });

    console.log();
    console.log("✅ Contract verified successfully!");
    console.log();
    console.log("🔗 View on BscScan:");
    console.log(`https://testnet.bscscan.com/address/${latestDeployment.aiOracle}#code`);
    console.log();
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log();
      console.log("✅ Contract already verified!");
      console.log();
      console.log("🔗 View on BscScan:");
      console.log(`https://testnet.bscscan.com/address/${latestDeployment.aiOracle}#code`);
      console.log();
    } else {
      console.error();
      console.error("❌ Verification failed:", error.message);
      console.error();
      console.error("Possible issues:");
      console.error("- BscScan API key not set in .env");
      console.error("- Contract not fully deployed yet (wait 1-2 minutes)");
      console.error("- Network mismatch");
      console.error();
      console.error("Manual verification command:");
      console.error(`npx hardhat verify --network bnbTestnet ${latestDeployment.aiOracle} "${latestDeployment.aiBot}" "${latestDeployment.disputeBond}" "0x0000000000000000000000000000000000000000"`);
      console.error();
      process.exit(1);
    }
  }

  // Verify UMAAdapter if deployed
  if (latestDeployment.umaAdapter && latestDeployment.umaAdapter !== "0x0000000000000000000000000000000000000000") {
    console.log("🔍 Verifying UMAAdapter contract...");
    console.log("=" .repeat(60));

    try {
      await run("verify:verify", {
        address: latestDeployment.umaAdapter,
        constructorArguments: [
          "0x0000000000000000000000000000000000000000", // UMA Oracle
          latestDeployment.mockToken,
          "10000000000000000000", // 10 tokens
          "100000000000000000000", // 100 tokens
        ],
      });

      console.log();
      console.log("✅ UMAAdapter verified successfully!");
      console.log();
      console.log("🔗 View on BscScan:");
      console.log(`https://testnet.bscscan.com/address/${latestDeployment.umaAdapter}#code`);
      console.log();
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log();
        console.log("✅ UMAAdapter already verified!");
        console.log();
      } else {
        console.error();
        console.error("⚠️  UMAAdapter verification failed:", error.message);
        console.error();
      }
    }
  }

  console.log("=" .repeat(60));
  console.log("🎉 VERIFICATION COMPLETE!");
  console.log("=" .repeat(60));
  console.log();
  console.log("Next steps:");
  console.log("1. View contract on BscScan");
  console.log("2. Test contract interactions");
  console.log("3. Update frontend with contract address");
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

