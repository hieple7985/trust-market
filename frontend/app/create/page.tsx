'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { CreateMarketForm } from '@/components/CreateMarketForm';
import { ICPCreateForm } from '@/components/ICPCreateForm';
import { WalletGuard } from '@/components/WalletGuard';
import { Typography, Card, Tabs, Space } from 'antd';
import type { TabsProps } from 'antd';

const { Title, Paragraph } = Typography;

export default function CreateMarketPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialChainParam = searchParams?.get('chain');
  const initialChain = initialChainParam === 'icp' ? 'icp' : 'bnb';
  const [activeTab, setActiveTab] = useState<string>(initialChain);

  useEffect(() => {
    const param = searchParams?.get('chain');
    const next = param === 'icp' ? 'icp' : 'bnb';
    setActiveTab(next);
  }, [searchParams]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    const params = new URLSearchParams(searchParams?.toString());
    params.set('chain', key);
    const query = params.toString();
    router.replace(query ? `/create?${query}` : '/create');
  };

  const items: TabsProps['items'] = [
    {
      key: 'bnb',
      label: (
        <Space>
          <span style={{ fontSize: 14 }}>🔶</span>
          <span>BNB</span>
        </Space>
      ),
      children: (
        <WalletGuard requireConnection requireCorrectNetwork>
          <Card>
            <CreateMarketForm />
          </Card>
        </WalletGuard>
      ),
    },
    {
      key: 'icp',
      label: (
        <Space>
          <span style={{ fontSize: 14 }}>∞</span>
          <span>ICP</span>
        </Space>
      ),
      children: <ICPCreateForm />,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <main style={{ padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ fontSize: 24 }}>
            Create Prediction Market
          </Title>
          <Paragraph style={{ fontSize: 14, color: '#666' }}>
            Choose a chain and create a new prediction market.
          </Paragraph>
        </div>
        <Tabs activeKey={activeTab} onChange={handleTabChange} size="large" items={items} />
      </main>
    </div>
  );
}
