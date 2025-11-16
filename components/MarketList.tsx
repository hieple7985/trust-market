'use client';

import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { Input, Button, Card, Space, Spin, Empty, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { MarketCard } from './MarketCard';
import { MarketWithProposal, MarketStatus } from '@/lib/types';
import { CONTRACTS, AI_ORACLE_ABI } from '@/lib/contracts';

const { Text } = Typography;

export function MarketList() {
  const [markets, setMarkets] = useState<MarketWithProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'proposed' | 'finalized'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const publicClient = usePublicClient();

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      setIsLoading(true);

      if (!publicClient) {
        console.log('Public client not ready');
        return;
      }

      // Get current block number
      const latestBlock = await publicClient.getBlockNumber();
      // Query last 10,000 blocks (~8 hours on BSC Testnet at 3s/block)
      // Most public RPCs limit to 10k-50k blocks per query
      const fromBlock = latestBlock > 10000n ? latestBlock - 10000n : 0n;

      // Get MarketCreated events
      const logs = await publicClient.getLogs({
        address: CONTRACTS.AI_ORACLE,
        event: {
          type: 'event',
          name: 'MarketCreated',
          inputs: [
            { type: 'bytes32', indexed: true, name: 'questionId' },
            { type: 'string', indexed: false, name: 'question' },
            { type: 'uint256', indexed: false, name: 'resolutionTime' },
            { type: 'uint256', indexed: false, name: 'livenessPeriod' },
          ],
        },
        fromBlock,
        toBlock: 'latest',
      });

      // Fetch market details for each event
      const marketPromises = logs.map(async (log) => {
        const questionId = log.topics[1] as `0x${string}`;

        // Read market data
        const marketData = await publicClient.readContract({
          address: CONTRACTS.AI_ORACLE,
          abi: AI_ORACLE_ABI,
          functionName: 'getMarket',
          args: [questionId],
        });

        // Read proposal data
        const proposalData = await publicClient.readContract({
          address: CONTRACTS.AI_ORACLE,
          abi: AI_ORACLE_ABI,
          functionName: 'getProposal',
          args: [questionId],
        });

        const market = marketData as any;
        const proposal = proposalData as any;

        // Determine status
        let status: MarketStatus;
        if (market.resolved) {
          status = MarketStatus.FINALIZED;
        } else if (market.disputed) {
          status = MarketStatus.DISPUTED;
        } else if (proposal.exists) {
          status = MarketStatus.PROPOSED;
        } else {
          status = MarketStatus.PENDING;
        }

        return {
          questionId,
          question: market.question,
          resolutionTime: market.resolutionTime,
          livenessPeriod: market.livenessPeriod,
          resolved: market.resolved,
          outcome: market.outcome,
          disputed: market.disputed,
          creator: market.creator,
          proposal: proposal.exists ? proposal : undefined,
          status,
        } as MarketWithProposal;
      });

      const loadedMarkets = await Promise.all(marketPromises);
      
      // Sort by resolution time (newest first)
      loadedMarkets.sort((a, b) => Number(b.resolutionTime) - Number(a.resolutionTime));
      
      setMarkets(loadedMarkets);
    } catch (error) {
      console.error('Error loading markets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter markets
  const filteredMarkets = markets.filter((market) => {
    // Filter by status
    if (filter !== 'all') {
      if (filter === 'pending' && market.status !== MarketStatus.PENDING) return false;
      if (filter === 'proposed' && market.status !== MarketStatus.PROPOSED) return false;
      if (filter === 'finalized' && market.status !== MarketStatus.FINALIZED) return false;
    }

    // Filter by search query
    if (searchQuery && !market.question.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Filters */}
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Input
            size="large"
            placeholder="Search markets..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />

          <Space wrap>
            <Button
              type={filter === 'all' ? 'primary' : 'default'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              type={filter === 'pending' ? 'primary' : 'default'}
              onClick={() => setFilter('pending')}
            >
              Pending
            </Button>
            <Button
              type={filter === 'proposed' ? 'primary' : 'default'}
              onClick={() => setFilter('proposed')}
            >
              Proposed
            </Button>
            <Button
              type={filter === 'finalized' ? 'primary' : 'default'}
              onClick={() => setFilter('finalized')}
            >
              Finalized
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadMarkets}
            >
              Refresh
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Market Count */}
      <Text type="secondary">
        Showing {filteredMarkets.length} of {markets.length} markets
      </Text>

      {/* Markets Grid */}
      {filteredMarkets.length === 0 ? (
        <Card>
          <Empty
            description={
              markets.length === 0
                ? 'No markets yet. Be the first to create one!'
                : 'No markets found. Try adjusting your filters.'
            }
          />
        </Card>
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {filteredMarkets.map((market) => (
            <MarketCard key={market.questionId} market={market} />
          ))}
        </Space>
      )}
    </Space>
  );
}

