import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deployment script for PredictAI Oracle contracts
 * 
 * Deploys:
 * 1. AIOracle contract
 * 2. UMAAdapter contract (optional)
 * 3. MockERC20 for testing (testnet only)
 * 
 * Usage:
 * - Local: npx hardhat run scripts/deploy.ts
 * - Testnet: npx hardhat run scripts/deploy.ts --network bnbTestnet
 */

interface DeploymentAddresses {
  network: string;
  timestamp: string;
  aiOracle: string;
  umaAdapter?: string;
  mockOracle?: string; // Add this
  mockToken?: string;
  aiBot: string;
  disputeBond: string;
  deployer: string;
}

async function main() {
  console.log("🚀 Starting PredictAI Oracle deployment...\n");

  // Get network info
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  console.log(`📡 Network: ${networkName} (Chain ID: ${network.chainId})`);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB\n`);

  // Check if we have enough balance
  if (balance < ethers.parseEther("0.1")) {
    console.warn("⚠️  Warning: Low balance. You may need more BNB for deployment.");
  }

  // Deployment parameters
  const AI_BOT_ADDRESS = deployer.address; // For testing, use deployer as AI bot
  const DISPUTE_BOND = ethers.parseEther("0.1"); // 0.1 BNB
  const UMA_ORACLE_ADDRESS = ethers.ZeroAddress; // No UMA for MVP

  console.log("📋 Deployment Parameters:");
  console.log(`   AI Bot: ${AI_BOT_ADDRESS}`);
  console.log(`   Dispute Bond: ${ethers.formatEther(DISPUTE_BOND)} BNB`);
  console.log(`   UMA Oracle: ${UMA_ORACLE_ADDRESS} (disabled for MVP)\n`);

  // Deploy AIOracle
  console.log("📦 Deploying AIOracle...");
  const AIOracle = await ethers.getContractFactory("AIOracle");
  const aiOracle = await AIOracle.deploy(
    AI_BOT_ADDRESS,
    DISPUTE_BOND,
    UMA_ORACLE_ADDRESS
  );
  await aiOracle.waitForDeployment();
  const aiOracleAddress = await aiOracle.getAddress();
  console.log(`✅ AIOracle deployed to: ${aiOracleAddress}\n`);

  // Deploy MockERC20 for testnet (for UMAAdapter testing)
  let mockTokenAddress = "";
  if (networkName !== "mainnet") {
    console.log("📦 Deploying MockERC20 (for testing)...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("Mock USDC", "USDC", 18);
    await mockToken.waitForDeployment();
    mockTokenAddress = await mockToken.getAddress();
    console.log(`✅ MockERC20 deployed to: ${mockTokenAddress}\n`);

    // Mint some tokens to deployer
    console.log("💵 Minting 10,000 USDC to deployer...");
    await mockToken.mint(deployer.address, ethers.parseEther("10000"));
    console.log("✅ Tokens minted\n");
  }

  // Deploy MockOptimisticOracle for testnet
  console.log("📦 Deploying MockOptimisticOracle...");
  const MockOracle = await ethers.getContractFactory("MockOptimisticOracle");
  const mockOracle = await MockOracle.deploy();
  await mockOracle.waitForDeployment();
  const mockOracleAddress = await mockOracle.getAddress();
  console.log(`✅ MockOptimisticOracle deployed to: ${mockOracleAddress}\n`);

  // Deploy UMAAdapter (optional)
  let umaAdapterAddress = "";
  if (mockTokenAddress) {
    console.log("📦 Deploying UMAAdapter...");
    const UMAAdapter = await ethers.getContractFactory("UMAAdapter");
    const umaAdapter = await UMAAdapter.deploy(
      mockOracleAddress, // Use Mock UMA Oracle
      mockTokenAddress,
      ethers.parseEther("10"), // Default reward: 10 tokens
      ethers.parseEther("100") // Default bond: 100 tokens
    );
    await umaAdapter.waitForDeployment();
    umaAdapterAddress = await umaAdapter.getAddress();
    console.log(`✅ UMAAdapter deployed to: ${umaAdapterAddress}\n`);
  }

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const aiBot = await aiOracle.aiBot();
  const disputeBond = await aiOracle.disputeBond();
  console.log(`   AI Bot: ${aiBot} ${aiBot === AI_BOT_ADDRESS ? "✅" : "❌"}`);
  console.log(`   Dispute Bond: ${ethers.formatEther(disputeBond)} BNB ${disputeBond === DISPUTE_BOND ? "✅" : "❌"}`);
  console.log();

  // Save deployment addresses
  const deploymentInfo: DeploymentAddresses = {
    network: networkName,
    timestamp: new Date().toISOString(),
    aiOracle: aiOracleAddress,
    umaAdapter: umaAdapterAddress || undefined,
    mockOracle: mockOracleAddress || undefined, // Add this
    mockToken: mockTokenAddress || undefined,
    aiBot: AI_BOT_ADDRESS,
    disputeBond: ethers.formatEther(DISPUTE_BOND),
    deployer: deployer.address,
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${networkName}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: deployments/${filename}\n`);

  // Print summary
  console.log("=" .repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log(`Network: ${networkName}`);
  console.log(`AIOracle: ${aiOracleAddress}`);
  if (umaAdapterAddress) {
    console.log(`UMAAdapter: ${umaAdapterAddress}`);
  }
  if (mockTokenAddress) {
    console.log(`MockERC20: ${mockTokenAddress}`);
  }
  console.log("=" .repeat(60));

  // Print verification commands
  if (networkName === "bnbTestnet") {
    console.log("\n📝 To verify on BscScan:");
    console.log(`npx hardhat verify --network bnbTestnet ${aiOracleAddress} "${AI_BOT_ADDRESS}" "${DISPUTE_BOND}" "${mockOracleAddress}"`);
    if (umaAdapterAddress && mockTokenAddress) {
      console.log(`npx hardhat verify --network bnbTestnet ${umaAdapterAddress} "${mockOracleAddress}" "${mockTokenAddress}" "${ethers.parseEther("10")}" "${ethers.parseEther("100")}"`);
    }
    if (mockOracleAddress) {
      console.log(`npx hardhat verify --network bnbTestnet ${mockOracleAddress}`);
    }
    if (mockTokenAddress) {
      console.log(`npx hardhat verify --network bnbTestnet ${mockTokenAddress} "Mock USDC" "USDC" 18`);
    }
  }

  console.log("\n✨ Next steps:");
  console.log("1. Verify contracts on block explorer");
  console.log("2. Test contract interactions on testnet");
  console.log("3. Create a test market");
  console.log("4. Propose a resolution");
  console.log("5. Test dispute mechanism\n");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

