export interface Market {
  questionId: string;
  question: string;
  resolutionTime: bigint;
  livenessPeriod: bigint;
  resolved: boolean;
  outcome: boolean;
  disputed: boolean;
  creator: string;
}

export interface Proposal {
  outcome: boolean;
  reasoning: string;
  sources: string;
  proposalTime: bigint;
  exists: boolean;
}

export enum MarketStatus {
  PENDING = 'pending',
  PROPOSED = 'proposed',
  DISPUTED = 'disputed',
  FINALIZED = 'finalized',
}

export interface MarketWithProposal extends Market {
  proposal?: Proposal;
  status: MarketStatus;
}

