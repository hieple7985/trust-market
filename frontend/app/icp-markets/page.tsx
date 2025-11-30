import { Header } from '@/components/Header';
import { ICPMarketList } from '@/components/ICPMarketList';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function ICPMarketsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <main style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ fontSize: 24 }}>ICP Prediction Markets</Title>
          <Paragraph style={{ fontSize: 14, color: '#666' }}>
            Bitcoin prediction markets on Internet Computer
          </Paragraph>
        </div>
        <ICPMarketList />
      </main>
    </div>
  );
}
