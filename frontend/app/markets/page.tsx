'use client';

import { Header } from '@/components/Header';
import { MarketList } from '@/components/MarketList';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function MarketsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <main style={{ padding: '24px 16px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ fontSize: 24 }}>Prediction Markets</Title>
          <Paragraph style={{ fontSize: 14, color: '#666' }}>
            Browse all prediction markets powered by AI and UMA Oracle
          </Paragraph>
        </div>
        <MarketList />
      </main>
    </div>
  );
}

