// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAIOracle
 * @notice Interface for the AI-powered prediction market oracle
 * @dev Defines the core functionality for creating markets, proposing resolutions, and handling disputes
 */
interface IAIOracle {
    /// @notice Market status enum
    enum MarketStatus {
        PENDING,    // Waiting for resolution
        PROPOSED,   // AI proposed answer
        DISPUTED,   // Escalated to UMA
        RESOLVED    // Finalized
    }

    /// @notice Market data structure
    struct Market {
        bytes32 questionId;
        string question;
        uint256 resolutionTime;
        address proposer;
        bool outcome;
        uint256 proposalTimestamp;
        uint256 livenessEnd;
        MarketStatus status;
        string reasoning;
        string[] sources;
    }

    /// @notice Emitted when a new market is created
    event MarketCreated(
        bytes32 indexed questionId,
        string question,
        uint256 resolutionTime,
        uint256 liveness,
        address indexed creator
    );

    /// @notice Emitted when AI bot proposes a resolution
    event ResolutionProposed(
        bytes32 indexed questionId,
        bool outcome,
        string reasoning,
        uint256 livenessEnd,
        address indexed proposer
    );

    /// @notice Emitted when a resolution is disputed
    event ResolutionDisputed(
        bytes32 indexed questionId,
        address indexed disputer,
        uint256 bondAmount
    );

    /// @notice Emitted when a market is finalized
    event MarketResolved(
        bytes32 indexed questionId,
        bool outcome,
        MarketStatus finalStatus
    );

    /// @notice Create a new prediction market
    /// @param question The question to be resolved
    /// @param resolutionTime Timestamp when the market can be resolved
    /// @param liveness Duration in seconds for the liveness period
    /// @return questionId Unique identifier for the market
    function createMarket(
        string memory question,
        uint256 resolutionTime,
        uint256 liveness
    ) external returns (bytes32 questionId);

    /// @notice AI bot proposes a resolution for a market
    /// @param questionId The market identifier
    /// @param outcome The proposed outcome (true/false)
    /// @param reasoning Explanation for the resolution
    /// @param sources Data sources used for resolution
    function proposeResolution(
        bytes32 questionId,
        bool outcome,
        string memory reasoning,
        string[] memory sources
    ) external;

    /// @notice Dispute an AI-proposed resolution
    /// @param questionId The market identifier
    function disputeResolution(bytes32 questionId) external payable;

    /// @notice Finalize a market after liveness period
    /// @param questionId The market identifier
    function finalizeResolution(bytes32 questionId) external;

    /// @notice Get market details
    /// @param questionId The market identifier
    /// @return market The market data
    function getMarket(bytes32 questionId) external view returns (Market memory market);

    /// @notice Get the AI bot address
    /// @return The address authorized to propose resolutions
    function aiBot() external view returns (address);

    /// @notice Get the dispute bond amount
    /// @return The amount required to dispute a resolution
    function disputeBond() external view returns (uint256);
}

