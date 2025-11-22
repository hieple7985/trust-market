// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOptimisticOracle
 * @notice Simplified interface for UMA Optimistic Oracle V3
 * @dev This is a minimal interface for the hackathon MVP
 */
interface IOptimisticOracle {
    /// @notice Request data structure
    struct Request {
        address proposer;
        address disputer;
        address currency;
        bool settled;
        int256 proposedPrice;
        int256 resolvedPrice;
        uint256 expirationTime;
        uint256 reward;
        uint256 finalFee;
        uint256 bond;
        uint256 customLiveness;
    }

    /// @notice Request a price from the oracle
    /// @param identifier Price identifier being requested
    /// @param timestamp Timestamp of the price being requested
    /// @param ancillaryData Additional data for the request
    /// @param currency ERC20 token used for payment of rewards and fees
    /// @param reward Reward offered to a successful proposer
    function requestPrice(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData,
        address currency,
        uint256 reward
    ) external returns (uint256 totalBond);

    /// @notice Propose a price value for an existing price request
    /// @param requester Sender of the initial price request
    /// @param identifier Price identifier being requested
    /// @param timestamp Timestamp of the price being requested
    /// @param ancillaryData Additional data for the request
    /// @param proposedPrice Price being proposed
    function proposePrice(
        address requester,
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData,
        int256 proposedPrice
    ) external returns (uint256 totalBond);

    /// @notice Dispute a price request with an active proposal
    /// @param requester Sender of the initial price request
    /// @param identifier Price identifier being requested
    /// @param timestamp Timestamp of the price being requested
    /// @param ancillaryData Additional data for the request
    function disputePrice(
        address requester,
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData
    ) external returns (uint256 totalBond);

    /// @notice Settle a price request after the liveness period has passed
    /// @param requester Sender of the initial price request
    /// @param identifier Price identifier being requested
    /// @param timestamp Timestamp of the price being requested
    /// @param ancillaryData Additional data for the request
    function settle(
        address requester,
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData
    ) external returns (int256 price);

    /// @notice Get the current state of a price request
    /// @param requester Sender of the initial price request
    /// @param identifier Price identifier being requested
    /// @param timestamp Timestamp of the price being requested
    /// @param ancillaryData Additional data for the request
    function getRequest(
        address requester,
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData
    ) external view returns (Request memory);

    /// @notice Check if a price has been settled
    /// @param requester Sender of the initial price request
    /// @param identifier Price identifier being requested
    /// @param timestamp Timestamp of the price being requested
    /// @param ancillaryData Additional data for the request
    function hasPrice(
        address requester,
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData
    ) external view returns (bool);
}

