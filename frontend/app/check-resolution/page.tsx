'use client';

import { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { Card, Button, Typography, Space, Table } from 'antd';
import { CONTRACTS, AI_ORACLE_ABI } from '@/lib/contracts';

const { Title, Text, Paragraph } = Typography;

interface MarketStatus {
  questionId: string;
  question: string;
  resolutionTime: bigint;
  resolutionDate: string;
  timeUntilResolution: string;
  status: string;
  hasProposal: boolean;
  isReady: boolean;
  proposer?: string;
  outcome?: boolean;
  reasoning?: string;
}

export default function CheckResolutionPage() {
  const [markets, setMarkets] = useState<MarketStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const publicClient = usePublicClient();

  const checkMarkets = async () => {
    if (!publicClient) return;

    setLoading(true);
    try {
      const latestBlock = await publicClient.getBlockNumber();
      const fromBlock = latestBlock - 200000n;

      // Get all MarketCreated events
      const events = await publicClient.getContractEvents({
        address: CONTRACTS.AI_ORACLE,
        abi: AI_ORACLE_ABI,
        eventName: 'MarketCreated',
        fromBlock,
        toBlock: latestBlock,
      });

      console.log(`Found ${events.length} markets`);

      const now = Math.floor(Date.now() / 1000);
      const marketStatuses: MarketStatus[] = [];

      for (const event of events) {
        const questionId = (event.args as any).questionId;
        const question = (event.args as any).question;
        const resolutionTime = (event.args as any).resolutionTime;

        // Get full market data
        const market = await publicClient.readContract({
          address: CONTRACTS.AI_ORACLE,
          abi: AI_ORACLE_ABI,
          functionName: 'getMarket',
          args: [questionId],
        }) as any;

        const resolutionDate = new Date(Number(resolutionTime) * 1000);
        const timeUntilResolution = Number(resolutionTime) - now;
        const hasProposal = market.proposer !== '0x0000000000000000000000000000000000000000';
        const isReady = timeUntilResolution <= 0 && !hasProposal;

        const statusMap = ['PENDING', 'PROPOSED', 'DISPUTED', 'FINALIZED'];
        const status = statusMap[market.status] || 'UNKNOWN';

        let timeString = '';
        if (timeUntilResolution > 0) {
          const hours = Math.floor(timeUntilResolution / 3600);
          const minutes = Math.floor((timeUntilResolution % 3600) / 60);
          timeString = `In ${hours}h ${minutes}m`;
        } else {
          const hoursAgo = Math.floor(Math.abs(timeUntilResolution) / 3600);
          const minutesAgo = Math.floor((Math.abs(timeUntilResolution) % 3600) / 60);
          timeString = `${hoursAgo}h ${minutesAgo}m ago`;
        }

        marketStatuses.push({
          questionId,
          question,
          resolutionTime,
          resolutionDate: resolutionDate.toLocaleString(),
          timeUntilResolution: timeString,
          status,
          hasProposal,
          isReady,
          proposer: hasProposal ? market.proposer : undefined,
          outcome: hasProposal ? market.outcome : undefined,
          reasoning: hasProposal ? market.reasoning : undefined,
        });
      }

      setMarkets(marketStatuses);
    } catch (error) {
      console.error('Error checking markets:', error);
    }
    setLoading(false);
  };

  const columns = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
      width: 300,
    },
    {
      title: 'Resolution Time',
      dataIndex: 'resolutionDate',
      key: 'resolutionDate',
      width: 200,
    },
    {
      title: 'Time Until/Since',
      dataIndex: 'timeUntilResolution',
      key: 'timeUntilResolution',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Text strong style={{ 
          color: status === 'FINALIZED' ? 'green' : 
                 status === 'PROPOSED' ? 'blue' : 
                 status === 'DISPUTED' ? 'red' : 'gray' 
        }}>
          {status}
        </Text>
      ),
    },
    {
      title: 'Ready for AI?',
      dataIndex: 'isReady',
      key: 'isReady',
      width: 120,
      render: (isReady: boolean) => (
        <Text strong style={{ color: isReady ? 'green' : 'gray' }}>
          {isReady ? '✅ YES' : '❌ NO'}
        </Text>
      ),
    },
    {
      title: 'Has Proposal',
      dataIndex: 'hasProposal',
      key: 'hasProposal',
      width: 120,
      render: (hasProposal: boolean) => (
        <Text>{hasProposal ? 'Yes' : 'No'}</Text>
      ),
    },
  ];

  const readyCount = markets.filter(m => m.isReady).length;

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <Title level={2}>🤖 AI Resolution Status Check</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Paragraph>
            This page checks which markets are ready for AI resolution.
            Markets are ready when:
          </Paragraph>
          <ul>
            <li>Resolution time has passed</li>
            <li>No proposal has been submitted yet</li>
            <li>Status is PENDING</li>
          </ul>

          <Button 
            type="primary" 
            size="large" 
            onClick={checkMarkets} 
            loading={loading}
            disabled={!publicClient}
          >
            {loading ? 'Checking...' : 'Check Markets'}
          </Button>

          {markets.length > 0 && (
            <div>
              <Title level={4}>Summary</Title>
              <Text>Total markets: <strong>{markets.length}</strong></Text>
              <br />
              <Text>Ready for AI resolution: <strong style={{ color: readyCount > 0 ? 'green' : 'gray' }}>{readyCount}</strong></Text>
              
              {readyCount > 0 && (
                <div style={{ marginTop: 16, padding: 16, background: '#f0f9ff', borderRadius: 8 }}>
                  <Text strong style={{ color: 'green' }}>
                    ✅ {readyCount} market(s) ready for AI resolution!
                  </Text>
                  <br />
                  <Text>Run AI bot: <code>pnpm tsx services/ai-bot.ts</code></Text>
                </div>
              )}
            </div>
          )}
        </Space>
      </Card>

      {markets.length > 0 && (
        <Card title="Markets Status">
          <Table 
            columns={columns} 
            dataSource={markets}
            rowKey="questionId"
            scroll={{ x: 1200 }}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ padding: 16 }}>
                  <p><strong>Question ID:</strong> {record.questionId}</p>
                  {record.hasProposal && (
                    <>
                      <p><strong>Proposer:</strong> {record.proposer}</p>
                      <p><strong>Outcome:</strong> {record.outcome ? 'TRUE' : 'FALSE'}</p>
                      {record.reasoning && (
                        <p><strong>Reasoning:</strong> {record.reasoning}</p>
                      )}
                    </>
                  )}
                </div>
              ),
            }}
          />
        </Card>
      )}
    </div>
  );
}
