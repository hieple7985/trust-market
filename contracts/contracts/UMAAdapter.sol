// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IOptimisticOracle.sol";

/**
 * @title UMAAdapter
 * @notice Adapter contract for integrating with UMA Optimistic Oracle V3
 * @dev Handles escalation of disputed predictions to UMA DVM
 * 
 * This is a simplified version for the hackathon MVP.
 * In production, this would handle:
 * - Bond management (proposal + dispute bonds)
 * - Reward distribution
 * - Callbacks from UMA DVM
 * - Multi-currency support
 */
contract UMAAdapter is Ownable {
    /// @notice UMA Optimistic Oracle V3 contract
    IOptimisticOracle public immutable umaOracle;

    /// @notice Currency used for bonds and rewards (e.g., USDC)
    IERC20 public bondCurrency;

    /// @notice Default reward for proposers
    uint256 public defaultReward;

    /// @notice Default bond amount
    uint256 public defaultBond;

    /// @notice UMA price identifier for binary questions
    bytes32 public constant UMA_IDENTIFIER = bytes32("YES_OR_NO_QUERY");

    /// @notice Mapping of questionId to UMA request timestamp
    mapping(bytes32 => uint256) public umaRequestTimestamps;

    /// @notice Mapping of questionId to resolution status
    mapping(bytes32 => bool) public isResolved;

    /// @notice Mapping of questionId to final outcome
    mapping(bytes32 => int256) public finalOutcomes;

    /// @notice Events
    event DisputeEscalated(
        bytes32 indexed questionId,
        uint256 timestamp,
        bytes ancillaryData
    );

    event UMAResolutionReceived(
        bytes32 indexed questionId,
        int256 outcome,
        uint256 timestamp
    );

    event BondCurrencyUpdated(address indexed newCurrency);
    event RewardUpdated(uint256 newReward);
    event BondUpdated(uint256 newBond);

    /// @notice Custom errors
    error InvalidOracleAddress();
    error InvalidCurrencyAddress();
    error AlreadyEscalated();
    error NotEscalated();
    error AlreadyResolved();
    error InvalidOutcome();

    /**
     * @notice Constructor
     * @param _umaOracle Address of UMA Optimistic Oracle V3
     * @param _bondCurrency Address of ERC20 token for bonds (e.g., USDC)
     * @param _defaultReward Default reward amount for proposers
     * @param _defaultBond Default bond amount
     */
    constructor(
        address _umaOracle,
        address _bondCurrency,
        uint256 _defaultReward,
        uint256 _defaultBond
    ) Ownable(msg.sender) {
        if (_umaOracle == address(0)) revert InvalidOracleAddress();
        if (_bondCurrency == address(0)) revert InvalidCurrencyAddress();

        umaOracle = IOptimisticOracle(_umaOracle);
        bondCurrency = IERC20(_bondCurrency);
        defaultReward = _defaultReward;
        defaultBond = _defaultBond;
    }

    /**
     * @notice Escalate a disputed question to UMA
     * @param questionId Unique identifier for the question
     * @param question The question text
     * @param proposedOutcome The AI-proposed outcome
     * @return timestamp The timestamp of the UMA request
     */
    function escalateToUMA(
        bytes32 questionId,
        string memory question,
        bool proposedOutcome
    ) external onlyOwner returns (uint256 timestamp) {
        // Check if already escalated
        if (umaRequestTimestamps[questionId] != 0) revert AlreadyEscalated();

        // Create ancillary data with question details
        bytes memory ancillaryData = abi.encodePacked(
            "Q: ",
            question,
            " Proposed: ",
            proposedOutcome ? "YES" : "NO"
        );

        // Use current timestamp for the request
        timestamp = block.timestamp;

        // Approve bond currency for UMA Oracle
        bondCurrency.approve(address(umaOracle), defaultBond + defaultReward);

        // Request price from UMA
        // Note: In production, this would actually call the UMA Oracle
        // For MVP, we're just recording the escalation
        umaRequestTimestamps[questionId] = timestamp;

        emit DisputeEscalated(questionId, timestamp, ancillaryData);

        return timestamp;
    }

    /**
     * @notice Settle a UMA request and get the final outcome
     * @param questionId Unique identifier for the question
     * @param question The question text
     * @param proposedOutcome The AI-proposed outcome
     * @return outcome The final outcome from UMA (-1, 0, or 1)
     */
    function settleUMARequest(
        bytes32 questionId,
        string memory question,
        bool proposedOutcome
    ) external returns (int256 outcome) {
        // Check if escalated
        uint256 timestamp = umaRequestTimestamps[questionId];
        if (timestamp == 0) revert NotEscalated();
        if (isResolved[questionId]) revert AlreadyResolved();

        // Create ancillary data (must match escalation)
        bytes memory ancillaryData = abi.encodePacked(
            "Q: ",
            question,
            " Proposed: ",
            proposedOutcome ? "YES" : "NO"
        );

        // In production, this would call:
        // outcome = umaOracle.settle(address(this), UMA_IDENTIFIER, timestamp, ancillaryData);
        
        // For MVP, we simulate the settlement
        // In a real scenario, UMA DVM would return:
        // - 1e18 for YES
        // - 0 for NO
        // - 0.5e18 for UNKNOWN/INVALID
        
        // For now, we'll just mark as resolved
        isResolved[questionId] = true;
        finalOutcomes[questionId] = proposedOutcome ? int256(1e18) : int256(0);
        outcome = finalOutcomes[questionId];

        emit UMAResolutionReceived(questionId, outcome, timestamp);

        return outcome;
    }

    /**
     * @notice Check if a question has been resolved by UMA
     * @param questionId Unique identifier for the question
     * @return True if resolved, false otherwise
     */
    function isUMAResolved(bytes32 questionId) external view returns (bool) {
        return isResolved[questionId];
    }

    /**
     * @notice Get the final outcome from UMA
     * @param questionId Unique identifier for the question
     * @return outcome The final outcome (-1, 0, or 1)
     */
    function getUMAOutcome(bytes32 questionId) external view returns (int256 outcome) {
        if (!isResolved[questionId]) revert NotEscalated();
        return finalOutcomes[questionId];
    }

    /**
     * @notice Convert UMA outcome to boolean
     * @param umaOutcome The outcome from UMA (in wei, e.g., 1e18 for YES)
     * @return True for YES, false for NO
     */
    function convertUMAOutcome(int256 umaOutcome) public pure returns (bool) {
        // UMA returns 1e18 for YES, 0 for NO
        // We consider >= 0.5e18 as YES
        return umaOutcome >= 0.5e18;
    }

    /**
     * @notice Update bond currency (owner only)
     * @param _bondCurrency New bond currency address
     */
    function setBondCurrency(address _bondCurrency) external onlyOwner {
        if (_bondCurrency == address(0)) revert InvalidCurrencyAddress();
        bondCurrency = IERC20(_bondCurrency);
        emit BondCurrencyUpdated(_bondCurrency);
    }

    /**
     * @notice Update default reward (owner only)
     * @param _defaultReward New default reward amount
     */
    function setDefaultReward(uint256 _defaultReward) external onlyOwner {
        defaultReward = _defaultReward;
        emit RewardUpdated(_defaultReward);
    }

    /**
     * @notice Update default bond (owner only)
     * @param _defaultBond New default bond amount
     */
    function setDefaultBond(uint256 _defaultBond) external onlyOwner {
        defaultBond = _defaultBond;
        emit BondUpdated(_defaultBond);
    }

    /**
     * @notice Withdraw ERC20 tokens (owner only)
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     */
    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(IERC20(token).transfer(owner(), amount), "Transfer failed");
    }
}

