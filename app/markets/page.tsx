'use client';

import { Header } from '@/components/Header';
import { MarketList } from '@/components/MarketList';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function MarketsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <main style={{ padding: '48px 24px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <Title level={2}>Prediction Markets</Title>
          <Paragraph style={{ fontSize: 16, color: '#666' }}>
            Browse all prediction markets powered by AI and UMA Oracle
          </Paragraph>
        </div>
        <MarketList />
      </main>
    </div>
  );
}

