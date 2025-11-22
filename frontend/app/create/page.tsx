'use client';

import { Header } from '@/components/Header';
import { CreateMarketForm } from '@/components/CreateMarketForm';
import { WalletGuard } from '@/components/WalletGuard';
import { Typography, Card } from 'antd';

const { Title, Paragraph } = Typography;

export default function CreateMarketPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <main style={{ padding: '24px 16px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ fontSize: 24 }}>Create Prediction Market</Title>
          <Paragraph style={{ fontSize: 14, color: '#666' }}>
            Create a new prediction market that will be automatically resolved by AI
          </Paragraph>
        </div>

        <WalletGuard requireConnection requireCorrectNetwork>
          <Card>
            <CreateMarketForm />
          </Card>
        </WalletGuard>
      </main>
    </div>
  );
}

