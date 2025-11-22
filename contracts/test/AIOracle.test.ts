import { expect } from "chai";
import { ethers } from "hardhat";
import { AIOracle } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("AIOracle", function () {
  let aiOracle: AIOracle;
  let owner: SignerWithAddress;
  let aiBot: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const DISPUTE_BOND = ethers.parseEther("0.1"); // 0.1 ETH
  const DEFAULT_LIVENESS = 2 * 60 * 60; // 2 hours
  const MIN_LIVENESS = 30 * 60; // 30 minutes
  const MAX_LIVENESS = 7 * 24 * 60 * 60; // 7 days

  beforeEach(async function () {
    // Get signers
    [owner, aiBot, user1, user2] = await ethers.getSigners();

    // Deploy AIOracle
    const AIOracle = await ethers.getContractFactory("AIOracle");
    aiOracle = await AIOracle.deploy(
      aiBot.address,
      DISPUTE_BOND,
      ethers.ZeroAddress // No UMA Oracle for tests
    );
    await aiOracle.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct AI bot address", async function () {
      expect(await aiOracle.aiBot()).to.equal(aiBot.address);
    });

    it("Should set the correct dispute bond", async function () {
      expect(await aiOracle.disputeBond()).to.equal(DISPUTE_BOND);
    });

    it("Should set the correct owner", async function () {
      expect(await aiOracle.owner()).to.equal(owner.address);
    });

    it("Should have correct liveness constants", async function () {
      expect(await aiOracle.DEFAULT_LIVENESS()).to.equal(DEFAULT_LIVENESS);
      expect(await aiOracle.MIN_LIVENESS()).to.equal(MIN_LIVENESS);
      expect(await aiOracle.MAX_LIVENESS()).to.equal(MAX_LIVENESS);
    });
  });

  describe("Market Creation", function () {
    const question = "Will BTC reach $100k by end of 2025?";
    let futureTime: number;

    beforeEach(async function () {
      const currentTime = await time.latest();
      futureTime = currentTime + 24 * 60 * 60; // 1 day from now
    });

    it("Should create a market successfully", async function () {
      const tx = await aiOracle.connect(user1).createMarket(
        question,
        futureTime,
        DEFAULT_LIVENESS
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "MarketCreated"
      );

      expect(event).to.not.be.undefined;
    });

    it("Should generate unique question IDs", async function () {
      const tx1 = await aiOracle.connect(user1).createMarket(
        question,
        futureTime,
        DEFAULT_LIVENESS
      );
      const receipt1 = await tx1.wait();
      
      const tx2 = await aiOracle.connect(user1).createMarket(
        question,
        futureTime,
        DEFAULT_LIVENESS
      );
      const receipt2 = await tx2.wait();

      // Question IDs should be different even with same parameters
      expect(receipt1?.hash).to.not.equal(receipt2?.hash);
    });

    it("Should revert if resolution time is in the past", async function () {
      const pastTime = (await time.latest()) - 1000;
      
      await expect(
        aiOracle.connect(user1).createMarket(question, pastTime, DEFAULT_LIVENESS)
      ).to.be.revertedWithCustomError(aiOracle, "InvalidResolutionTime");
    });

    it("Should revert if liveness is too short", async function () {
      const tooShort = MIN_LIVENESS - 1;
      
      await expect(
        aiOracle.connect(user1).createMarket(question, futureTime, tooShort)
      ).to.be.revertedWithCustomError(aiOracle, "InvalidLiveness");
    });

    it("Should revert if liveness is too long", async function () {
      const tooLong = MAX_LIVENESS + 1;
      
      await expect(
        aiOracle.connect(user1).createMarket(question, futureTime, tooLong)
      ).to.be.revertedWithCustomError(aiOracle, "InvalidLiveness");
    });

    it("Should emit MarketCreated event with correct parameters", async function () {
      await expect(
        aiOracle.connect(user1).createMarket(question, futureTime, DEFAULT_LIVENESS)
      )
        .to.emit(aiOracle, "MarketCreated")
        .withArgs(
          (value: any) => value !== ethers.ZeroHash, // questionId
          question,
          futureTime,
          DEFAULT_LIVENESS,
          user1.address
        );
    });
  });

  describe("Proposal Submission", function () {
    let questionId: string;
    const question = "Will ETH reach $5k by end of 2025?";
    let resolutionTime: number;

    beforeEach(async function () {
      const currentTime = await time.latest();
      resolutionTime = currentTime + 1000; // 1000 seconds from now

      const tx = await aiOracle.connect(user1).createMarket(
        question,
        resolutionTime,
        DEFAULT_LIVENESS
      );
      const receipt = await tx.wait();
      
      // Extract questionId from event
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "MarketCreated"
      ) as any;
      questionId = event?.args[0];
    });

    it("Should allow AI bot to propose resolution after resolution time", async function () {
      // Fast forward to resolution time
      await time.increaseTo(resolutionTime + 1);

      const reasoning = "Based on market analysis and price trends";
      const sources = ["CoinGecko", "CoinMarketCap"];

      await expect(
        aiOracle.connect(aiBot).proposeResolution(
          questionId,
          true,
          reasoning,
          sources
        )
      ).to.emit(aiOracle, "ResolutionProposed");
    });

    it("Should revert if non-AI bot tries to propose", async function () {
      await time.increaseTo(resolutionTime + 1);

      await expect(
        aiOracle.connect(user1).proposeResolution(
          questionId,
          true,
          "reasoning",
          []
        )
      ).to.be.revertedWithCustomError(aiOracle, "Unauthorized");
    });

    it("Should revert if proposing before resolution time", async function () {
      await expect(
        aiOracle.connect(aiBot).proposeResolution(
          questionId,
          true,
          "reasoning",
          []
        )
      ).to.be.revertedWithCustomError(aiOracle, "ResolutionTimeNotReached");
    });

    it("Should revert if market doesn't exist", async function () {
      const fakeId = ethers.keccak256(ethers.toUtf8Bytes("fake"));
      
      await expect(
        aiOracle.connect(aiBot).proposeResolution(
          fakeId,
          true,
          "reasoning",
          []
        )
      ).to.be.revertedWithCustomError(aiOracle, "MarketNotFound");
    });

    it("Should update market status to PROPOSED", async function () {
      await time.increaseTo(resolutionTime + 1);

      await aiOracle.connect(aiBot).proposeResolution(
        questionId,
        true,
        "reasoning",
        ["source1"]
      );

      const market = await aiOracle.getMarket(questionId);
      expect(market.status).to.equal(1); // PROPOSED = 1
    });

    it("Should store reasoning and sources correctly", async function () {
      await time.increaseTo(resolutionTime + 1);

      const reasoning = "Detailed analysis";
      const sources = ["Source A", "Source B", "Source C"];

      await aiOracle.connect(aiBot).proposeResolution(
        questionId,
        false,
        reasoning,
        sources
      );

      const market = await aiOracle.getMarket(questionId);
      expect(market.reasoning).to.equal(reasoning);
      expect(market.sources.length).to.equal(3);
      expect(market.sources[0]).to.equal("Source A");
    });
  });

  describe("Dispute Mechanism", function () {
    let questionId: string;
    const question = "Will SOL reach $200 by end of 2025?";
    let resolutionTime: number;

    beforeEach(async function () {
      const currentTime = await time.latest();
      resolutionTime = currentTime + 1000;

      // Create market
      const tx = await aiOracle.connect(user1).createMarket(
        question,
        resolutionTime,
        DEFAULT_LIVENESS
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "MarketCreated"
      ) as any;
      questionId = event?.args[0];

      // Fast forward and propose
      await time.increaseTo(resolutionTime + 1);
      await aiOracle.connect(aiBot).proposeResolution(
        questionId,
        true,
        "reasoning",
        ["source"]
      );
    });

    it("Should allow dispute with correct bond", async function () {
      await expect(
        aiOracle.connect(user2).disputeResolution(questionId, {
          value: DISPUTE_BOND,
        })
      ).to.emit(aiOracle, "ResolutionDisputed");
    });

    it("Should revert if bond is insufficient", async function () {
      const insufficientBond = DISPUTE_BOND - 1n;

      await expect(
        aiOracle.connect(user2).disputeResolution(questionId, {
          value: insufficientBond,
        })
      ).to.be.revertedWithCustomError(aiOracle, "InsufficientDisputeBond");
    });

    it("Should update market status to DISPUTED", async function () {
      await aiOracle.connect(user2).disputeResolution(questionId, {
        value: DISPUTE_BOND,
      });

      const market = await aiOracle.getMarket(questionId);
      expect(market.status).to.equal(2); // DISPUTED = 2
    });

    it("Should revert if disputing after liveness period", async function () {
      // Fast forward past liveness period
      await time.increase(DEFAULT_LIVENESS + 1);

      await expect(
        aiOracle.connect(user2).disputeResolution(questionId, {
          value: DISPUTE_BOND,
        })
      ).to.be.revertedWithCustomError(aiOracle, "LivenessNotExpired");
    });
  });

  describe("Market Finalization", function () {
    let questionId: string;
    const question = "Will AVAX reach $50 by end of 2025?";
    let resolutionTime: number;

    beforeEach(async function () {
      const currentTime = await time.latest();
      resolutionTime = currentTime + 1000;

      // Create market
      const tx = await aiOracle.connect(user1).createMarket(
        question,
        resolutionTime,
        DEFAULT_LIVENESS
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "MarketCreated"
      ) as any;
      questionId = event?.args[0];

      // Fast forward and propose
      await time.increaseTo(resolutionTime + 1);
      await aiOracle.connect(aiBot).proposeResolution(
        questionId,
        true,
        "reasoning",
        ["source"]
      );
    });

    it("Should finalize market after liveness period", async function () {
      // Fast forward past liveness period
      await time.increase(DEFAULT_LIVENESS + 1);

      await expect(
        aiOracle.connect(user1).finalizeResolution(questionId)
      ).to.emit(aiOracle, "MarketResolved");
    });

    it("Should update market status to RESOLVED", async function () {
      await time.increase(DEFAULT_LIVENESS + 1);
      await aiOracle.connect(user1).finalizeResolution(questionId);

      const market = await aiOracle.getMarket(questionId);
      expect(market.status).to.equal(3); // RESOLVED = 3
    });

    it("Should revert if finalizing before liveness period", async function () {
      await expect(
        aiOracle.connect(user1).finalizeResolution(questionId)
      ).to.be.revertedWithCustomError(aiOracle, "LivenessNotExpired");
    });

    it("Should revert if market is not in PROPOSED status", async function () {
      // Dispute the market first
      await aiOracle.connect(user2).disputeResolution(questionId, {
        value: DISPUTE_BOND,
      });

      await time.increase(DEFAULT_LIVENESS + 1);

      await expect(
        aiOracle.connect(user1).finalizeResolution(questionId)
      ).to.be.revertedWithCustomError(aiOracle, "MarketNotProposed");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update AI bot address", async function () {
      const newAIBot = user1.address;
      await aiOracle.connect(owner).setAIBot(newAIBot);
      expect(await aiOracle.aiBot()).to.equal(newAIBot);
    });

    it("Should revert if non-owner tries to update AI bot", async function () {
      await expect(
        aiOracle.connect(user1).setAIBot(user2.address)
      ).to.be.revertedWithCustomError(aiOracle, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to update dispute bond", async function () {
      const newBond = ethers.parseEther("0.5");
      await aiOracle.connect(owner).setDisputeBond(newBond);
      expect(await aiOracle.disputeBond()).to.equal(newBond);
    });

    it("Should allow owner to withdraw bonds", async function () {
      // Create and dispute a market to accumulate bonds
      const currentTime = await time.latest();
      const futureTime = currentTime + 1000;

      const tx = await aiOracle.connect(user1).createMarket(
        "Test question",
        futureTime,
        DEFAULT_LIVENESS
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "MarketCreated"
      ) as any;
      const questionId = event?.args[0];

      await time.increaseTo(futureTime + 1);
      await aiOracle.connect(aiBot).proposeResolution(
        questionId,
        true,
        "reasoning",
        ["source"]
      );

      // Dispute to send bond
      await aiOracle.connect(user2).disputeResolution(questionId, {
        value: DISPUTE_BOND,
      });

      const contractBalance = await ethers.provider.getBalance(
        await aiOracle.getAddress()
      );
      expect(contractBalance).to.equal(DISPUTE_BOND);

      // Withdraw
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const tx2 = await aiOracle.connect(owner).withdrawBonds();
      const receipt2 = await tx2.wait();
      const gasUsed = receipt2!.gasUsed * receipt2!.gasPrice;

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.equal(
        ownerBalanceBefore + DISPUTE_BOND - gasUsed
      );
    });
  });

  describe("View Functions", function () {
    it("Should return market details correctly", async function () {
      const question = "Test question?";
      const currentTime = await time.latest();
      const futureTime = currentTime + 1000;

      const tx = await aiOracle.connect(user1).createMarket(
        question,
        futureTime,
        DEFAULT_LIVENESS
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "MarketCreated"
      ) as any;
      const questionId = event?.args[0];

      const market = await aiOracle.getMarket(questionId);
      expect(market.question).to.equal(question);
      expect(market.resolutionTime).to.equal(futureTime);
      expect(market.status).to.equal(0); // PENDING
    });

    it("Should revert when getting non-existent market", async function () {
      const fakeId = ethers.keccak256(ethers.toUtf8Bytes("fake"));

      await expect(
        aiOracle.getMarket(fakeId)
      ).to.be.revertedWithCustomError(aiOracle, "MarketNotFound");
    });
  });
});

