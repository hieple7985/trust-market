// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IAIOracle.sol";
import "./interfaces/IOptimisticOracle.sol";

/**
 * @title AIOracle
 * @notice AI-powered oracle for prediction markets with UMA dispute mechanism
 * @dev Combines fast AI resolution (5-10 min) with UMA's economic security
 * 
 * Flow:
 * 1. Market created with question + resolution time
 * 2. AI bot proposes resolution after resolution time
 * 3. Liveness period (e.g., 2 hours) for disputes
 * 4. If disputed → escalate to UMA DVM
 * 5. If not disputed → finalize with AI resolution
 */
contract AIOracle is IAIOracle, Ownable, ReentrancyGuard {
    /// @notice Address authorized to propose resolutions
    address public aiBot;

    /// @notice UMA Optimistic Oracle address (for disputes)
    IOptimisticOracle public umaOracle;

    /// @notice Bond required to dispute a resolution (in wei)
    uint256 public disputeBond;

    /// @notice Default liveness period (2 hours)
    uint256 public constant DEFAULT_LIVENESS = 2 hours;

    /// @notice Minimum liveness period (30 minutes)
    uint256 public constant MIN_LIVENESS = 30 minutes;

    /// @notice Maximum liveness period (7 days)
    uint256 public constant MAX_LIVENESS = 7 days;

    /// @notice UMA price identifier for binary questions
    bytes32 public constant UMA_IDENTIFIER = bytes32("YES_OR_NO_QUERY");

    /// @notice Mapping of questionId to Market data
    mapping(bytes32 => Market) public markets;

    /// @notice Mapping to track if a questionId exists
    mapping(bytes32 => bool) public marketExists;

    /// @notice Counter for generating unique question IDs
    uint256 private questionCounter;

    /// @notice Custom errors for gas efficiency
    error Unauthorized();
    error MarketNotFound();
    error MarketAlreadyExists();
    error InvalidResolutionTime();
    error InvalidLiveness();
    error MarketNotPending();
    error MarketNotProposed();
    error ResolutionTimeNotReached();
    error LivenessNotExpired();
    error InsufficientDisputeBond();
    error MarketAlreadyDisputed();
    error MarketAlreadyResolved();
    error InvalidOutcome();

    /// @notice Modifier to restrict access to AI bot
    modifier onlyAIBot() {
        if (msg.sender != aiBot) revert Unauthorized();
        _;
    }

    /**
     * @notice Constructor
     * @param _aiBot Address of the AI bot
     * @param _disputeBond Bond amount required to dispute (in wei)
     * @param _umaOracle Address of UMA Optimistic Oracle (optional for MVP)
     */
    constructor(
        address _aiBot,
        uint256 _disputeBond,
        address _umaOracle
    ) Ownable(msg.sender) {
        require(_aiBot != address(0), "Invalid AI bot address");
        aiBot = _aiBot;
        disputeBond = _disputeBond;
        umaOracle = IOptimisticOracle(_umaOracle);
    }

    /**
     * @notice Create a new prediction market
     * @param question The question to be resolved
     * @param resolutionTime Timestamp when the market can be resolved
     * @param liveness Duration in seconds for the liveness period
     * @return questionId Unique identifier for the market
     */
    function createMarket(
        string memory question,
        uint256 resolutionTime,
        uint256 liveness
    ) external returns (bytes32 questionId) {
        // Validate inputs
        if (resolutionTime <= block.timestamp) revert InvalidResolutionTime();
        if (liveness < MIN_LIVENESS || liveness > MAX_LIVENESS) revert InvalidLiveness();

        // Generate unique question ID
        questionCounter++;
        questionId = keccak256(
            abi.encodePacked(
                question,
                resolutionTime,
                msg.sender,
                questionCounter,
                block.timestamp
            )
        );

        // Check for collision (extremely unlikely)
        if (marketExists[questionId]) revert MarketAlreadyExists();

        // Create market
        Market storage market = markets[questionId];
        market.questionId = questionId;
        market.question = question;
        market.resolutionTime = resolutionTime;
        market.status = MarketStatus.PENDING;
        
        // Initialize empty arrays
        market.sources = new string[](0);

        marketExists[questionId] = true;

        emit MarketCreated(
            questionId,
            question,
            resolutionTime,
            liveness,
            msg.sender
        );

        return questionId;
    }

    /**
     * @notice AI bot proposes a resolution for a market
     * @param questionId The market identifier
     * @param outcome The proposed outcome (true/false)
     * @param reasoning Explanation for the resolution
     * @param sources Data sources used for resolution
     */
    function proposeResolution(
        bytes32 questionId,
        bool outcome,
        string memory reasoning,
        string[] memory sources
    ) external onlyAIBot {
        Market storage market = markets[questionId];
        
        // Validate market exists and is in correct state
        if (!marketExists[questionId]) revert MarketNotFound();
        if (market.status != MarketStatus.PENDING) revert MarketNotPending();
        if (block.timestamp < market.resolutionTime) revert ResolutionTimeNotReached();

        // Update market with proposal
        market.proposer = msg.sender;
        market.outcome = outcome;
        market.reasoning = reasoning;
        market.sources = sources;
        market.proposalTimestamp = block.timestamp;
        market.livenessEnd = block.timestamp + DEFAULT_LIVENESS;
        market.status = MarketStatus.PROPOSED;

        emit ResolutionProposed(
            questionId,
            outcome,
            reasoning,
            market.livenessEnd,
            msg.sender
        );
    }

    /**
     * @notice Dispute an AI-proposed resolution
     * @param questionId The market identifier
     * @dev Requires sending the dispute bond amount
     */
    function disputeResolution(bytes32 questionId) external payable nonReentrant {
        Market storage market = markets[questionId];

        // Validate market state
        if (!marketExists[questionId]) revert MarketNotFound();
        if (market.status != MarketStatus.PROPOSED) revert MarketNotProposed();
        if (block.timestamp >= market.livenessEnd) revert LivenessNotExpired();
        if (msg.value < disputeBond) revert InsufficientDisputeBond();

        // Update market status
        market.status = MarketStatus.DISPUTED;

        emit ResolutionDisputed(questionId, msg.sender, msg.value);

        // TODO: Escalate to UMA Oracle in production
        // For MVP, disputed markets are marked as DISPUTED
        // In production, this would call umaOracle.requestPrice()
    }

    /**
     * @notice Finalize a market after liveness period
     * @param questionId The market identifier
     */
    function finalizeResolution(bytes32 questionId) external {
        Market storage market = markets[questionId];

        // Validate market state
        if (!marketExists[questionId]) revert MarketNotFound();
        if (market.status != MarketStatus.PROPOSED) revert MarketNotProposed();
        if (block.timestamp < market.livenessEnd) revert LivenessNotExpired();

        // Finalize market
        market.status = MarketStatus.RESOLVED;

        emit MarketResolved(
            questionId,
            market.outcome,
            MarketStatus.RESOLVED
        );
    }

    /**
     * @notice Get market details
     * @param questionId The market identifier
     * @return market The market data
     */
    function getMarket(bytes32 questionId) external view returns (Market memory market) {
        if (!marketExists[questionId]) revert MarketNotFound();
        return markets[questionId];
    }

    /**
     * @notice Update AI bot address (owner only)
     * @param _aiBot New AI bot address
     */
    function setAIBot(address _aiBot) external onlyOwner {
        require(_aiBot != address(0), "Invalid AI bot address");
        aiBot = _aiBot;
    }

    /**
     * @notice Update dispute bond amount (owner only)
     * @param _disputeBond New dispute bond amount
     */
    function setDisputeBond(uint256 _disputeBond) external onlyOwner {
        disputeBond = _disputeBond;
    }

    /**
     * @notice Update UMA Oracle address (owner only)
     * @param _umaOracle New UMA Oracle address
     */
    function setUMAOracle(address _umaOracle) external onlyOwner {
        umaOracle = IOptimisticOracle(_umaOracle);
    }

    /**
     * @notice Withdraw accumulated dispute bonds (owner only)
     * @dev In production, this would handle bond redistribution
     */
    function withdrawBonds() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Receive function to accept ETH
     */
    receive() external payable {}
}

