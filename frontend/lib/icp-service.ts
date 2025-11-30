import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

export interface Market {
  id: string;
  question: string;
  description: string;
  resolutionTime: bigint;
  creator: Principal;
  status: { Pending: null } | { Proposed: null } | { Finalized: null };
  totalYes: bigint;
  totalNo: bigint;
  outcome: [] | [boolean];
  reasoning: [] | [string];
}

export interface Position {
  marketId: string;
  user: Principal;
  isYes: boolean;
  amount: bigint;
}

export interface ICPBackendActor {
  createMarket: (question: string, description: string, resolutionTime: bigint) => Promise<string>;
  placeBet: (marketId: string, isYes: boolean, amount: bigint) => Promise<boolean>;
  proposeResolution: (marketId: string, outcome: boolean, reasoning: string) => Promise<boolean>;
  finalizeMarket: (marketId: string) => Promise<boolean>;
  getMarket: (id: string) => Promise<[] | [Market]>;
  getAllMarkets: () => Promise<Market[]>;
  getUserPositions: (user: Principal) => Promise<Position[]>;
}

let authClient: AuthClient | null = null;
let actor: ICPBackendActor | null = null;

export async function initAuth(): Promise<AuthClient> {
  if (!authClient) {
    authClient = await AuthClient.create();
  }
  return authClient;
}

export async function login(): Promise<boolean> {
  const client = await initAuth();
  
  return new Promise((resolve) => {
    client.login({
      identityProvider: process.env.NEXT_PUBLIC_INTERNET_IDENTITY_URL || 'https://identity.ic0.app',
      onSuccess: () => resolve(true),
      onError: () => resolve(false),
    });
  });
}

export async function logout(): Promise<void> {
  const client = await initAuth();
  await client.logout();
  actor = null;
}

export async function isAuthenticated(): Promise<boolean> {
  const client = await initAuth();
  return await client.isAuthenticated();
}

export async function getIdentity() {
  const client = await initAuth();
  return client.getIdentity();
}

export async function getActor(): Promise<ICPBackendActor> {
  if (actor) return actor;

  const client = await initAuth();
  const identity = client.getIdentity();
  
  const agent = new HttpAgent({
    identity,
    host: process.env.NEXT_PUBLIC_IC_HOST || 'http://127.0.0.1:8000',
  });

  if (process.env.NODE_ENV !== 'production') {
    await agent.fetchRootKey();
  }

  const canisterId = process.env.NEXT_PUBLIC_ICP_BACKEND_CANISTER_ID;
  if (!canisterId) {
    throw new Error('ICP Backend Canister ID not configured');
  }

  try {
    const { idlFactory } = await import('./declarations/icp_backend');
    actor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    }) as ICPBackendActor;
    
    return actor;
  } catch (error) {
    console.error('Failed to create actor:', error);
    throw new Error('Failed to initialize ICP backend actor. Make sure canisters are deployed.');
  }
}

export function formatMarketStatus(status: Market['status']): string {
  if ('Pending' in status) return 'Pending';
  if ('Proposed' in status) return 'Proposed';
  if ('Finalized' in status) return 'Finalized';
  return 'Unknown';
}

export function convertToDate(nanoseconds: bigint): Date {
  return new Date(Number(nanoseconds / 1000000n));
}

export function convertToNanoseconds(date: Date): bigint {
  return BigInt(date.getTime()) * 1000000n;
}
