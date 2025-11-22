import { expect } from "chai";
import { ethers } from "hardhat";
import { UMAAdapter } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("UMAAdapter", function () {
  let umaAdapter: UMAAdapter;
  let mockToken: any;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const DEFAULT_REWARD = ethers.parseEther("10"); // 10 tokens
  const DEFAULT_BOND = ethers.parseEther("100"); // 100 tokens

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy("Mock USDC", "USDC", 18);
    await mockToken.waitForDeployment();

    // Mint tokens to owner
    await mockToken.mint(owner.address, ethers.parseEther("10000"));

    // Deploy UMAAdapter
    const UMAAdapter = await ethers.getContractFactory("UMAAdapter");
    umaAdapter = await UMAAdapter.deploy(
      user1.address, // Mock UMA Oracle address
      await mockToken.getAddress(),
      DEFAULT_REWARD,
      DEFAULT_BOND
    );
    await umaAdapter.waitForDeployment();

    // Approve tokens for UMAAdapter
    await mockToken.approve(
      await umaAdapter.getAddress(),
      ethers.parseEther("10000")
    );
  });

  describe("Deployment", function () {
    it("Should set the correct UMA Oracle address", async function () {
      expect(await umaAdapter.umaOracle()).to.equal(user1.address);
    });

    it("Should set the correct bond currency", async function () {
      expect(await umaAdapter.bondCurrency()).to.equal(
        await mockToken.getAddress()
      );
    });

    it("Should set the correct default reward", async function () {
      expect(await umaAdapter.defaultReward()).to.equal(DEFAULT_REWARD);
    });

    it("Should set the correct default bond", async function () {
      expect(await umaAdapter.defaultBond()).to.equal(DEFAULT_BOND);
    });

    it("Should revert if UMA Oracle address is zero", async function () {
      const UMAAdapter = await ethers.getContractFactory("UMAAdapter");
      
      await expect(
        UMAAdapter.deploy(
          ethers.ZeroAddress,
          await mockToken.getAddress(),
          DEFAULT_REWARD,
          DEFAULT_BOND
        )
      ).to.be.revertedWithCustomError(umaAdapter, "InvalidOracleAddress");
    });

    it("Should revert if bond currency address is zero", async function () {
      const UMAAdapter = await ethers.getContractFactory("UMAAdapter");
      
      await expect(
        UMAAdapter.deploy(
          user1.address,
          ethers.ZeroAddress,
          DEFAULT_REWARD,
          DEFAULT_BOND
        )
      ).to.be.revertedWithCustomError(umaAdapter, "InvalidCurrencyAddress");
    });
  });

  describe("Escalate to UMA", function () {
    const questionId = ethers.keccak256(ethers.toUtf8Bytes("test-question-1"));
    const question = "Will BTC reach $100k?";
    const proposedOutcome = true;

    it("Should escalate dispute to UMA successfully", async function () {
      await expect(
        umaAdapter.connect(owner).escalateToUMA(questionId, question, proposedOutcome)
      ).to.emit(umaAdapter, "DisputeEscalated");
    });

    it("Should record the escalation timestamp", async function () {
      await umaAdapter.connect(owner).escalateToUMA(questionId, question, proposedOutcome);
      
      const timestamp = await umaAdapter.umaRequestTimestamps(questionId);
      expect(timestamp).to.be.gt(0);
    });

    it("Should revert if already escalated", async function () {
      await umaAdapter.connect(owner).escalateToUMA(questionId, question, proposedOutcome);
      
      await expect(
        umaAdapter.connect(owner).escalateToUMA(questionId, question, proposedOutcome)
      ).to.be.revertedWithCustomError(umaAdapter, "AlreadyEscalated");
    });

    it("Should revert if non-owner tries to escalate", async function () {
      await expect(
        umaAdapter.connect(user1).escalateToUMA(questionId, question, proposedOutcome)
      ).to.be.revertedWithCustomError(umaAdapter, "OwnableUnauthorizedAccount");
    });
  });

  describe("Settle UMA Request", function () {
    const questionId = ethers.keccak256(ethers.toUtf8Bytes("test-question-2"));
    const question = "Will ETH reach $5k?";
    const proposedOutcome = true;

    beforeEach(async function () {
      // Escalate first
      await umaAdapter.connect(owner).escalateToUMA(questionId, question, proposedOutcome);
    });

    it("Should settle UMA request successfully", async function () {
      await expect(
        umaAdapter.connect(owner).settleUMARequest(questionId, question, proposedOutcome)
      ).to.emit(umaAdapter, "UMAResolutionReceived");
    });

    it("Should mark question as resolved", async function () {
      await umaAdapter.connect(owner).settleUMARequest(questionId, question, proposedOutcome);
      
      const isResolved = await umaAdapter.isUMAResolved(questionId);
      expect(isResolved).to.be.true;
    });

    it("Should store the final outcome", async function () {
      await umaAdapter.connect(owner).settleUMARequest(questionId, question, proposedOutcome);
      
      const outcome = await umaAdapter.getUMAOutcome(questionId);
      expect(outcome).to.equal(ethers.parseEther("1")); // 1e18 for YES
    });

    it("Should revert if not escalated", async function () {
      const newQuestionId = ethers.keccak256(ethers.toUtf8Bytes("new-question"));
      
      await expect(
        umaAdapter.connect(owner).settleUMARequest(newQuestionId, question, proposedOutcome)
      ).to.be.revertedWithCustomError(umaAdapter, "NotEscalated");
    });

    it("Should revert if already resolved", async function () {
      await umaAdapter.connect(owner).settleUMARequest(questionId, question, proposedOutcome);
      
      await expect(
        umaAdapter.connect(owner).settleUMARequest(questionId, question, proposedOutcome)
      ).to.be.revertedWithCustomError(umaAdapter, "AlreadyResolved");
    });
  });

  describe("Outcome Conversion", function () {
    it("Should convert 1e18 to true (YES)", async function () {
      const outcome = ethers.parseEther("1");
      expect(await umaAdapter.convertUMAOutcome(outcome)).to.be.true;
    });

    it("Should convert 0 to false (NO)", async function () {
      const outcome = 0;
      expect(await umaAdapter.convertUMAOutcome(outcome)).to.be.false;
    });

    it("Should convert 0.5e18 to true (threshold)", async function () {
      const outcome = ethers.parseEther("0.5");
      expect(await umaAdapter.convertUMAOutcome(outcome)).to.be.true;
    });

    it("Should convert 0.49e18 to false (below threshold)", async function () {
      const outcome = ethers.parseEther("0.49");
      expect(await umaAdapter.convertUMAOutcome(outcome)).to.be.false;
    });

    it("Should convert 0.51e18 to true (above threshold)", async function () {
      const outcome = ethers.parseEther("0.51");
      expect(await umaAdapter.convertUMAOutcome(outcome)).to.be.true;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update bond currency", async function () {
      const newToken = user2.address;
      
      await expect(
        umaAdapter.connect(owner).setBondCurrency(newToken)
      ).to.emit(umaAdapter, "BondCurrencyUpdated").withArgs(newToken);
      
      expect(await umaAdapter.bondCurrency()).to.equal(newToken);
    });

    it("Should revert if setting zero address as bond currency", async function () {
      await expect(
        umaAdapter.connect(owner).setBondCurrency(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(umaAdapter, "InvalidCurrencyAddress");
    });

    it("Should allow owner to update default reward", async function () {
      const newReward = ethers.parseEther("20");
      
      await expect(
        umaAdapter.connect(owner).setDefaultReward(newReward)
      ).to.emit(umaAdapter, "RewardUpdated").withArgs(newReward);
      
      expect(await umaAdapter.defaultReward()).to.equal(newReward);
    });

    it("Should allow owner to update default bond", async function () {
      const newBond = ethers.parseEther("200");
      
      await expect(
        umaAdapter.connect(owner).setDefaultBond(newBond)
      ).to.emit(umaAdapter, "BondUpdated").withArgs(newBond);
      
      expect(await umaAdapter.defaultBond()).to.equal(newBond);
    });

    it("Should allow owner to withdraw tokens", async function () {
      // Transfer some tokens to the adapter
      const amount = ethers.parseEther("100");
      await mockToken.transfer(await umaAdapter.getAddress(), amount);
      
      const ownerBalanceBefore = await mockToken.balanceOf(owner.address);
      
      await umaAdapter.connect(owner).withdrawTokens(
        await mockToken.getAddress(),
        amount
      );
      
      const ownerBalanceAfter = await mockToken.balanceOf(owner.address);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + amount);
    });

    it("Should revert if non-owner tries to update settings", async function () {
      await expect(
        umaAdapter.connect(user1).setDefaultReward(ethers.parseEther("50"))
      ).to.be.revertedWithCustomError(umaAdapter, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    const questionId = ethers.keccak256(ethers.toUtf8Bytes("test-question-3"));
    const question = "Will SOL reach $200?";
    const proposedOutcome = false;

    it("Should return false for non-escalated question", async function () {
      expect(await umaAdapter.isUMAResolved(questionId)).to.be.false;
    });

    it("Should return false for escalated but not settled question", async function () {
      await umaAdapter.connect(owner).escalateToUMA(questionId, question, proposedOutcome);
      expect(await umaAdapter.isUMAResolved(questionId)).to.be.false;
    });

    it("Should return true for settled question", async function () {
      await umaAdapter.connect(owner).escalateToUMA(questionId, question, proposedOutcome);
      await umaAdapter.connect(owner).settleUMARequest(questionId, question, proposedOutcome);
      
      expect(await umaAdapter.isUMAResolved(questionId)).to.be.true;
    });

    it("Should revert when getting outcome for non-escalated question", async function () {
      await expect(
        umaAdapter.getUMAOutcome(questionId)
      ).to.be.revertedWithCustomError(umaAdapter, "NotEscalated");
    });
  });
});

