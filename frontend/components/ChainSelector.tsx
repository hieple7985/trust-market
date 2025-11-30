'use client';

import { Dropdown, Button, Space, Tag } from 'antd';
import { DownOutlined, CheckOutlined } from '@ant-design/icons';
import { useChain } from '@/contexts/ChainContext';
import type { MenuProps } from 'antd';

export function ChainSelector() {
  const { selectedChain, setSelectedChain, isConnected } = useChain();
  
  const chains = [
    {
      key: 'bnb' as const,
      label: 'BNB Chain',
      icon: '🔶',
      description: 'Layer 2 • Low fees',
    },
    {
      key: 'icp' as const,
      label: 'Internet Computer',
      icon: '∞',
      description: 'Bitcoin • AI Resolution',
    },
  ];
  
  const menuItems: MenuProps['items'] = chains.map(chain => ({
    key: chain.key,
    label: (
      <Space direction="vertical" style={{ width: '100%' }} size={4}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space>
            <span style={{ fontSize: 14 }}>{chain.icon}</span>
            <span>{chain.label}</span>
          </Space>
          {chain.key === selectedChain && <CheckOutlined style={{ color: '#52c41a' }} />}
        </Space>
        <div style={{ fontSize: 12, color: '#999', paddingLeft: 22 }}>
          {chain.description}
        </div>
        {isConnected(chain.key) && (
          <Tag color="green" style={{ margin: 0, marginLeft: 22 }}>Connected</Tag>
        )}
      </Space>
    ),
    onClick: () => setSelectedChain(chain.key),
  }));
  
  const activeChain = chains.find(c => c.key === selectedChain);
  
  return (
    <Dropdown menu={{ items: menuItems, style: { minWidth: 280 } }} trigger={['click']}>
      <Button>
        <Space>
          <span>{activeChain?.icon}</span>
          <span>{activeChain?.label}</span>
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
}
