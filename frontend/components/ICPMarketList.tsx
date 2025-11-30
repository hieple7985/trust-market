'use client';

import { Card, Button, Space, Typography, Tag, Spin } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useICPAuth, useICPMarkets } from '@/hooks/useICP';
import { convertToDate, formatMarketStatus } from '@/lib/icp-service';
import { ChainBadge } from './ChainBadge';

const { Title, Text, Paragraph } = Typography;

export function ICPMarketList() {
  const { authenticated, principal, login, logout, loading: authLoading } = useICPAuth();
  const { markets, loading: marketsLoading, placeBet } = useICPMarkets();

  const handlePlaceBet = async (marketId: string, isYes: boolean) => {
    try {
      const amount = BigInt(100);
      const success = await placeBet(marketId, isYes, amount);
      if (success) {
        alert('Bet placed successfully!');
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
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading ICP Authentication...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Card style={{ maxWidth: 600, margin: '50px auto', textAlign: 'center' }}>
        <Title level={3}>ICP Prediction Markets</Title>
        <Paragraph>
          Connect with Internet Identity to view and participate in prediction markets on ICP.
        </Paragraph>
        <Button type="primary" size="large" onClick={login}>
          Login with Internet Identity
        </Button>
      </Card>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Text type="secondary">
            Connected: {principal?.toString().slice(0, 10)}...{principal?.toString().slice(-8)}
          </Text>
          <Space>
            <Link href="/create?chain=icp">
              <Button type="primary" icon={<PlusCircleOutlined />}>
                Create Market
              </Button>
            </Link>
            <Button onClick={logout}>Logout</Button>
          </Space>
        </div>
      </Card>

      <Card title="ICP Markets">
        {marketsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : markets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">No markets yet.</Text>
            <br />
            <Link href="/create?chain=icp">
              <Button type="primary" style={{ marginTop: 16 }}>
                Create the first market
              </Button>
            </Link>
          </div>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {markets.map((market) => (
              <Card key={market.id} size="small" style={{ backgroundColor: '#fafafa' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Space direction="vertical" style={{ flex: 1 }}>
                      <ChainBadge chain="icp" size="small" />
                      <Title level={5} style={{ margin: 0 }}>{market.question}</Title>
                    </Space>
                    <Tag color={
                      formatMarketStatus(market.status) === 'Pending' ? 'blue' :
                      formatMarketStatus(market.status) === 'Proposed' ? 'orange' : 'green'
                    }>
                      {formatMarketStatus(market.status)}
                    </Tag>
                  </div>
                  
                  <Paragraph style={{ margin: 0 }}>{market.description}</Paragraph>
                  
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
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
                      <Button type="primary" size="small" onClick={() => handlePlaceBet(market.id, true)}>
                        Bet YES (100)
                      </Button>
                      <Button danger size="small" onClick={() => handlePlaceBet(market.id, false)}>
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
    </Space>
  );
}

export default ICPMarketList;
