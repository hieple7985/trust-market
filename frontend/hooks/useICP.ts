import { useState, useEffect, useCallback } from 'react';
import {
  initAuth,
  login as icpLogin,
  logout as icpLogout,
  isAuthenticated,
  getActor,
  getIdentity,
  type Market,
  type Position,
} from '@/lib/icp-service';
import { Principal } from '@dfinity/principal';

export function useICPAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [principal, setPrincipal] = useState<Principal | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await isAuthenticated();
      setAuthenticated(isAuth);
      
      if (isAuth) {
        const identity = await getIdentity();
        setPrincipal(identity.getPrincipal());
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async () => {
    try {
      setLoading(true);
      const success = await icpLogin();
      if (success) {
        await checkAuth();
      }
      return success;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await icpLogout();
      setAuthenticated(false);
      setPrincipal(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    authenticated,
    loading,
    principal,
    login,
    logout,
  };
}

export function useICPMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const actor = await getActor();
      const allMarkets = await actor.getAllMarkets();
      setMarkets(allMarkets);
    } catch (err) {
      console.error('Failed to fetch markets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch markets');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMarket = useCallback(async (
    question: string,
    description: string,
    resolutionTime: bigint
  ) => {
    try {
      setLoading(true);
      setError(null);
      const actor = await getActor();
      const marketId = await actor.createMarket(question, description, resolutionTime);
      await fetchMarkets();
      return marketId;
    } catch (err) {
      console.error('Failed to create market:', err);
      setError(err instanceof Error ? err.message : 'Failed to create market');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMarkets]);

  const placeBet = useCallback(async (
    marketId: string,
    isYes: boolean,
    amount: bigint
  ) => {
    try {
      setLoading(true);
      setError(null);
      const actor = await getActor();
      const success = await actor.placeBet(marketId, isYes, amount);
      if (success) {
        await fetchMarkets();
      }
      return success;
    } catch (err) {
      console.error('Failed to place bet:', err);
      setError(err instanceof Error ? err.message : 'Failed to place bet');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMarkets]);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  return {
    markets,
    loading,
    error,
    fetchMarkets,
    createMarket,
    placeBet,
  };
}

export function useICPPositions(principal: Principal | null) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!principal) {
      setPositions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const actor = await getActor();
      const userPositions = await actor.getUserPositions(principal);
      setPositions(userPositions);
    } catch (err) {
      console.error('Failed to fetch positions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  }, [principal]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return {
    positions,
    loading,
    error,
    fetchPositions,
  };
}
