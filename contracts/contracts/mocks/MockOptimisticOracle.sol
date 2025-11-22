// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Mock Optimistic Oracle
 * @dev This is a simplified mock of UMA's Optimistic Oracle for testing purposes.
 * It allows the owner to instantly resolve a request without a liveness period.
 */
contract MockOptimisticOracle is Ownable {
    constructor() Ownable(msg.sender) {}

    struct Request {
        bool resolved;
        bytes result;
        uint256 resolutionTime;
    }

    mapping(bytes32 => Request) public requests;

    event RequestMade(bytes32 indexed identifier, uint256 timestamp, bytes ancillaryData);
    event RequestResolved(bytes32 indexed identifier, uint256 timestamp, bytes result);

    function makeRequest(bytes32 identifier, uint256 timestamp, bytes memory ancillaryData) external {
        require(!requests[identifier].resolved, "Request already exists");
        emit RequestMade(identifier, timestamp, ancillaryData);
    }

    function resolveRequest(bytes32 identifier, bytes memory result) external onlyOwner {
        require(!requests[identifier].resolved, "Request already resolved");
        requests[identifier] = Request({
            resolved: true,
            result: result,
            resolutionTime: block.timestamp
        });
        emit RequestResolved(identifier, block.timestamp, result);
    }

    function getRequest(bytes32 identifier) external view returns (Request memory) {
        return requests[identifier];
    }

    function hasResolved(bytes32 identifier) external view returns (bool) {
        return requests[identifier].resolved;
    }
}
