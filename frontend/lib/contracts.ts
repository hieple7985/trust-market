// Contract addresses - will be updated after deployment
// Clean addresses to remove any whitespace/newlines
// Support both NEXT_PUBLIC_ (for browser) and non-prefixed (for Node.js scripts)
export const CONTRACTS = {
  AI_ORACLE: ((process.env.NEXT_PUBLIC_AIORACLE_ADDRESS || process.env.AIORACLE_ADDRESS || '0x0000000000000000000000000000000000000000').trim()) as `0x${string}`,
  UMA_ADAPTER: ((process.env.NEXT_PUBLIC_UMA_ADAPTER_ADDRESS || process.env.UMA_ADAPTER_ADDRESS || '0x0000000000000000000000000000000000000000').trim()) as `0x${string}`,
};

// AIOracle ABI - essential functions only
export const AI_ORACLE_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_aiBot', type: 'address' },
      { internalType: 'uint256', name: '_disputeBond', type: 'uint256' },
      { internalType: 'address', name: '_umaOracle', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'InsufficientDisputeBond',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidLiveness',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidOutcome',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidResolutionTime',
    type: 'error',
  },
  {
    inputs: [],
    name: 'LivenessNotExpired',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketAlreadyResolved',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarketNotFound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoProposal',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotAIBot',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotResolved',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ResolutionTimeNotReached',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'questionId', type: 'bytes32' },
      { indexed: false, internalType: 'address', name: 'disputer', type: 'address' },
    ],
    name: 'DisputeRaised',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'questionId', type: 'bytes32' },
      { indexed: false, internalType: 'string', name: 'question', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'resolutionTime', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'liveness', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
    ],
    name: 'MarketCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'questionId', type: 'bytes32' },
      { indexed: false, internalType: 'bool', name: 'outcome', type: 'bool' },
    ],
    name: 'MarketFinalized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'questionId', type: 'bytes32' },
      { indexed: false, internalType: 'bool', name: 'proposedOutcome', type: 'bool' },
      { indexed: false, internalType: 'string', name: 'reasoning', type: 'string' },
    ],
    name: 'ResolutionProposed',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'string', name: 'question', type: 'string' },
      { internalType: 'uint256', name: 'resolutionTime', type: 'uint256' },
      { internalType: 'uint256', name: 'livenessPeriod', type: 'uint256' },
    ],
    name: 'createMarket',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'questionId', type: 'bytes32' }],
    name: 'disputeResolution',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'disputeBond',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'questionId', type: 'bytes32' }],
    name: 'finalizeMarket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'questionId', type: 'bytes32' }],
    name: 'getMarket',
    outputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'questionId', type: 'bytes32' },
          { internalType: 'string', name: 'question', type: 'string' },
          { internalType: 'uint256', name: 'resolutionTime', type: 'uint256' },
          { internalType: 'address', name: 'proposer', type: 'address' },
          { internalType: 'bool', name: 'outcome', type: 'bool' },
          { internalType: 'uint256', name: 'proposalTimestamp', type: 'uint256' },
          { internalType: 'uint256', name: 'livenessEnd', type: 'uint256' },
          { internalType: 'uint8', name: 'status', type: 'uint8' },
          { internalType: 'string', name: 'reasoning', type: 'string' },
          { internalType: 'string[]', name: 'sources', type: 'string[]' },
        ],
        internalType: 'struct AIOracle.Market',
        name: 'market',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'questionId', type: 'bytes32' }],
    name: 'getProposal',
    outputs: [
      {
        components: [
          { internalType: 'bool', name: 'outcome', type: 'bool' },
          { internalType: 'string', name: 'reasoning', type: 'string' },
          { internalType: 'string', name: 'sources', type: 'string' },
          { internalType: 'uint256', name: 'proposalTime', type: 'uint256' },
          { internalType: 'bool', name: 'exists', type: 'bool' },
        ],
        internalType: 'struct AIOracle.Proposal',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'questionId', type: 'bytes32' },
      { internalType: 'bool', name: 'outcome', type: 'bool' },
      { internalType: 'string', name: 'reasoning', type: 'string' },
      { internalType: 'string[]', name: 'sources', type: 'string[]' },
    ],
    name: 'proposeResolution',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

