'use client';

import { Header } from '@/components/Header';
import { MarketList } from '@/components/MarketList';
import { ICPMarketList } from '@/components/ICPMarketList';
import { Typography, Tabs, Space } from 'antd';
import type { TabsProps } from 'antd';

const { Title, Paragraph } = Typography;

export default function MarketsPage() {
  const items: TabsProps['items'] = [
    {
      key: 'bnb',
      label: (
        <Space>
          <span style={{ fontSize: 14 }}>🔶</span>
          <span>BNB</span>
        </Space>
      ),
      children: <MarketList />,
    },
    {
      key: 'icp',
      label: (
        <Space>
          <span style={{ fontSize: 14 }}>∞</span>
          <span>ICP</span>
        </Space>
      ),
      children: <ICPMarketList />,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <main style={{ padding: '24px 16px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ fontSize: 24 }}>Prediction Markets</Title>
          <Paragraph style={{ fontSize: 14, color: '#666' }}>
            Browse and trade prediction markets across BNB Chain and Internet Computer.
          </Paragraph>
        </div>
        <Tabs defaultActiveKey="bnb" size="large" items={items} />
      </main>
    </div>
  );
}
