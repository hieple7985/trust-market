'use client';

import { Header } from '@/components/Header';
import { CreateMarketForm } from '@/components/CreateMarketForm';
import { Typography, Card } from 'antd';

const { Title, Paragraph } = Typography;

export default function CreateMarketPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <main style={{ padding: '48px 24px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <Title level={2}>Create Prediction Market</Title>
          <Paragraph style={{ fontSize: 16, color: '#666' }}>
            Create a new prediction market that will be automatically resolved by AI
          </Paragraph>
        </div>

        <Card>
          <CreateMarketForm />
        </Card>
      </main>
    </div>
  );
}

