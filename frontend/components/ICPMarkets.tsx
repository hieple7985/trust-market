'use client';

import { useState } from 'react';
import { Card, Button, Input, DatePicker, Space, Typography, Tag, Spin } from 'antd';
import { useICPAuth, useICPMarkets } from '@/hooks/useICP';
import { convertToNanoseconds, convertToDate, formatMarketStatus } from '@/lib/icp-service';
import { ChainBadge } from './ChainBadge';
import type { Dayjs } from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ICPMarketsProps {
  hideHeader?: boolean;
}

export function ICPMarkets({ hideHeader = false }: ICPMarketsProps) {
  const { authenticated, principal, login, logout, loading: authLoading } = useICPAuth();
  const { markets, loading: marketsLoading, createMarket, placeBet } = useICPMarkets();
  
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [resolutionDate, setResolutionDate] = useState<Dayjs | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreateMarket = async () => {
    if (!question || !description || !resolutionDate) {
      alert('Please fill all fields');
      return;
    }

    try {
      setCreating(true);
      const resolutionTime = convertToNanoseconds(resolutionDate.toDate());
      const marketId = await createMarket(question, description, resolutionTime);
      alert(`Market created! ID: ${marketId}`);
      setQuestion('');
      setDescription('');
      setResolutionDate(null);
    } catch (error) {
      console.error('Failed to create market:', error);
      alert('Failed to create market');
    } finally {
      setCreating(false);
    }
  };

  const handlePlaceBet = async (marketId: string, isYes: boolean) => {
    try {
      const amount = BigInt(100); // 100 units for demo
      const success = await placeBet(marketId, isYes, amount);
      if (success) {
        alert(`Bet placed successfully!`);
      } else {
        alert('Failed to place bet');
      }
    } catch (error) {
      console.error('Failed to place bet:', error);
      alert('Failed to place bet');
    }
  };

  if (authLoading) {
    return (
      <main style={{ padding: '24px 16px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p>Loading ICP Authentication...</p>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main style={{ padding: '24px 16px', maxWidth: 1400, margin: '0 auto' }}>
        <Card style={{ maxWidth: 600, margin: '50px auto', textAlign: 'center' }}>
          <Title level={3}>ICP Bitcoin Prediction Markets</Title>
          <Paragraph>
            Connect with Internet Identity to create and participate in Bitcoin prediction markets on ICP.
          </Paragraph>
          <Button type="primary" size="large" onClick={login}>
            Login with Internet Identity
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main style={{ padding: hideHeader ? '0' : '24px 16px', maxWidth: 1400, margin: '0 auto' }}>
      {!hideHeader && (
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ fontSize: 24 }}>ICP Prediction Markets</Title>
          <Paragraph style={{ fontSize: 14, color: '#666' }}>
            Bitcoin prediction markets on Internet Computer powered by Internet Identity
          </Paragraph>
        </div>
      )}
      
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">
            Connected: {principal?.toString().slice(0, 10)}...{principal?.toString().slice(-8)}
          </Text>
          <Button onClick={logout}>Logout</Button>
        </div>
      </Card>

      <Card title="Create New Market" style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Question</Text>
            <Input
              placeholder="e.g., Will Bitcoin reach $100k by end of 2024?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>
          
          <div>
            <Text strong>Description</Text>
            <TextArea
              placeholder="Provide details about the market resolution criteria"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ marginTop: 8 }}
            />
          </div>
          
          <div>
            <Text strong>Resolution Date</Text>
            <br />
            <DatePicker
              showTime
              value={resolutionDate}
              onChange={setResolutionDate}
              style={{ marginTop: 8, width: '100%' }}
            />
          </div>
          
          <Button
            type="primary"
            onClick={handleCreateMarket}
            loading={creating}
            disabled={!question || !description || !resolutionDate}
          >
            Create Market
          </Button>
        </Space>
      </Card>

      <Card title="Active Markets">
        {marketsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : markets.length === 0 ? (
          <Text type="secondary">No markets yet. Create the first one!</Text>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {markets.map((market) => (
              <Card
                key={market.id}
                size="small"
                style={{ backgroundColor: '#fafafa' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Space direction="vertical" style={{ flex: 1 }}>
                      <ChainBadge chain="icp" size="small" />
                      <Title level={5} style={{ margin: 0 }}>{market.question}</Title>
                    </Space>
                    <Tag color={
                      formatMarketStatus(market.status) === 'Pending' ? 'blue' :
                      formatMarketStatus(market.status) === 'Proposed' ? 'orange' :
                      'green'
                    }>
                      {formatMarketStatus(market.status)}
                    </Tag>
                  </div>
                  
                  <Paragraph style={{ margin: 0 }}>{market.description}</Paragraph>
                  
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div>
                      <Text strong>YES: </Text>
                      <Text>{market.totalYes.toString()}</Text>
                    </div>
                    <div>
                      <Text strong>NO: </Text>
                      <Text>{market.totalNo.toString()}</Text>
                    </div>
                    <div>
                      <Text strong>Resolution: </Text>
                      <Text>{convertToDate(market.resolutionTime).toLocaleString()}</Text>
                    </div>
                  </div>
                  
                  {formatMarketStatus(market.status) === 'Pending' && (
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handlePlaceBet(market.id, true)}
                      >
                        Bet YES (100)
                      </Button>
                      <Button
                        danger
                        size="small"
                        onClick={() => handlePlaceBet(market.id, false)}
                      >
                        Bet NO (100)
                      </Button>
                    </Space>
                  )}
                  
                  {market.outcome.length > 0 && (
                    <div>
                      <Text strong>Outcome: </Text>
                      <Tag color={market.outcome[0] ? 'green' : 'red'}>
                        {market.outcome[0] ? 'YES' : 'NO'}
                      </Tag>
                      {market.reasoning.length > 0 && (
                        <Paragraph style={{ marginTop: 8 }}>
                          <Text type="secondary">{market.reasoning[0]}</Text>
                        </Paragraph>
                      )}
                    </div>
                  )}
                </Space>
              </Card>
            ))}
          </Space>
        )}
      </Card>
      </div>
    </main>
  );
}

export default ICPMarkets;
