'use client';

import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';
import { Input, Button, Card, Space, Spin, Empty, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { MarketCard } from './MarketCard';
import { MarketWithProposal, MarketStatus } from '@/lib/types';
import { CONTRACTS, AI_ORACLE_ABI } from '@/lib/contracts';

const { Text } = Typography;

export function MarketList() {
  const [markets, setMarkets] = useState<MarketWithProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [filter, setFilter] = useState<'all' | 'pending' | 'proposed' | 'finalized'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const publicClient = usePublicClient();

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      setIsLoading(true);
      setLoadingProgress({ current: 0, total: 0, percentage: 0 });

      if (!publicClient) {
        console.log('❌ Public client not ready');
        setIsLoading(false);
        return;
      }

      console.log('🔍 Loading markets with pagination...');
      console.log('📝 Contract address:', CONTRACTS.AI_ORACLE);

      // Get current block number
      const latestBlock = await publicClient.getBlockNumber();
      console.log('📦 Latest block:', latestBlock.toString());
      
      // Pagination settings
      // Ankr free tier limit: 3000 blocks per query (tested and confirmed)
      const BLOCKS_PER_QUERY = 3000n; // Max safe limit for Ankr free tier
      const MAX_BLOCKS_TO_SCAN = 200000n; // Scan last ~166 hours (~7 days) to ensure we find all markets
      const startBlock = latestBlock > MAX_BLOCKS_TO_SCAN ? latestBlock - MAX_BLOCKS_TO_SCAN : 0n;
      
      // Calculate number of queries needed
      const totalBlocks = latestBlock - startBlock;
      const numQueries = Math.ceil(Number(totalBlocks) / Number(BLOCKS_PER_QUERY));
      
      console.log(`📊 Scanning ${totalBlocks} blocks in ${numQueries} batches`);
      console.log(`   From block: ${startBlock}`);
      console.log(`   To block: ${latestBlock}`);
      console.log(`   Target blocks: 74062748, 74064373`);
      setLoadingProgress({ current: 0, total: numQueries, percentage: 0 });

      // Collect all logs from multiple queries
      const allLogs = [];
      
      for (let i = 0; i < numQueries; i++) {
        const fromBlock = startBlock + BigInt(i) * BLOCKS_PER_QUERY;
        const toBlock = i === numQueries - 1 
          ? latestBlock 
          : fromBlock + BLOCKS_PER_QUERY - 1n;

        console.log(`🔎 Query ${i + 1}/${numQueries}: blocks ${fromBlock} to ${toBlock}`);
        
        try {
          const logs = await publicClient.getContractEvents({
            address: CONTRACTS.AI_ORACLE,
            abi: AI_ORACLE_ABI,
            eventName: 'MarketCreated',
            fromBlock,
            toBlock,
          });

          allLogs.push(...logs);
          console.log(`  ✅ Found ${logs.length} events in this batch`);
        } catch (error) {
          console.warn(`  ⚠️ Error in batch ${i + 1}, skipping:`, error);
        }

        // Update progress
        const progress = Math.round(((i + 1) / numQueries) * 100);
        setLoadingProgress({ 
          current: i + 1, 
          total: numQueries, 
          percentage: progress 
        });
      }

      console.log(`📊 Total found: ${allLogs.length} MarketCreated events`);

      // Fetch market details for each event
      const marketPromises = allLogs.map(async (log: any) => {
        // getContractEvents returns args directly, not topics
        const questionId = log.args.questionId as `0x${string}`;

        // Read market data (now includes all data including proposal)
        const marketData = await publicClient.readContract({
          address: CONTRACTS.AI_ORACLE,
          abi: AI_ORACLE_ABI,
          functionName: 'getMarket',
          args: [questionId],
        });

        const market = marketData as any;

        // Status is now returned from contract (0=PENDING, 1=PROPOSED, 2=DISPUTED, 3=FINALIZED)
        const statusMap: Record<number, MarketStatus> = {
          0: MarketStatus.PENDING,
          1: MarketStatus.PROPOSED,
          2: MarketStatus.DISPUTED,
          3: MarketStatus.FINALIZED,
        };
        const status = statusMap[market.status] || MarketStatus.PENDING;

        // Build proposal object if exists
        const proposal = market.proposer !== '0x0000000000000000000000000000000000000000' ? {
          outcome: market.outcome,
          reasoning: market.reasoning,
          sources: market.sources,
          proposalTime: market.proposalTimestamp,
          exists: true,
        } : undefined;

        return {
          questionId: market.questionId,
          question: market.question,
          resolutionTime: market.resolutionTime,
          livenessPeriod: BigInt(market.livenessEnd) - BigInt(market.proposalTimestamp), // Calculate from livenessEnd
          resolved: status === MarketStatus.FINALIZED,
          outcome: market.outcome,
          disputed: status === MarketStatus.DISPUTED,
          creator: market.proposer,
          proposal,
          status,
        } as MarketWithProposal;
      });

      const loadedMarkets = await Promise.all(marketPromises);
      
      console.log('✅ Loaded', loadedMarkets.length, 'markets');
      loadedMarkets.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.question.substring(0, 50)}...`);
      });
      
      // Sort by resolution time (newest first)
      loadedMarkets.sort((a, b) => Number(b.resolutionTime) - Number(a.resolutionTime));
      
      setMarkets(loadedMarkets);
    } catch (error) {
      console.error('❌ Error loading markets:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
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
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <Spin size="large" />
        {loadingProgress.total > 0 && (
          <div style={{ marginTop: 24, maxWidth: 400, margin: '24px auto 0' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: 8,
              fontSize: 14,
              color: '#666'
            }}>
              <span>Scanning blockchain...</span>
              <span>{loadingProgress.percentage}%</span>
            </div>
            <div style={{
              width: '100%',
              height: 8,
              background: '#f0f0f0',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${loadingProgress.percentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #1890ff 0%, #52c41a 100%)',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ 
              marginTop: 8, 
              fontSize: 12, 
              color: '#999',
              textAlign: 'center'
            }}>
              Batch {loadingProgress.current} of {loadingProgress.total}
            </div>
          </div>
        )}
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

