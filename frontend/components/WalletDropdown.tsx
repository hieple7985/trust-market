'use client';

import { Dropdown, Button, Space, Tag } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useICPAuth } from '@/hooks/useICP';
import type { MenuProps } from 'antd';

export function WalletDropdown() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  
  const { authenticated, principal, login, logout } = useICPAuth();
  
  const connectedCount = (isConnected ? 1 : 0) + (authenticated ? 1 : 0);
  
  const menuItems: MenuProps['items'] = [
    {
      type: 'group',
      label: <Space><span style={{ fontSize: 14 }}>🔶</span> BNB Chain</Space>,
      children: [
        isConnected ? {
          key: 'bnb-connected',
          label: (
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Tag color="gold" style={{ margin: 0 }}>Connected</Tag>
                <Button size="small" onClick={(e) => { e.stopPropagation(); disconnect(); }}>
                  Disconnect
                </Button>
              </Space>
              <span style={{ fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </Space>
          ),
        } : {
          key: 'bnb-connect',
          label: (
            <Space>
              <WalletOutlined />
              Connect BNB Wallet
            </Space>
          ),
          onClick: openConnectModal,
        }
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'group',
      label: <Space><span style={{ fontSize: 14 }}>∞</span> Internet Computer</Space>,
      children: [
        authenticated ? {
          key: 'icp-connected',
          label: (
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Tag color="blue" style={{ margin: 0 }}>Connected</Tag>
                <Button size="small" onClick={(e) => { e.stopPropagation(); logout(); }}>
                  Disconnect
                </Button>
              </Space>
              <span style={{ fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
                {principal?.toString().slice(0, 10)}...
                {principal?.toString().slice(-8)}
              </span>
            </Space>
          ),
        } : {
          key: 'icp-connect',
          label: (
            <Space>
              <WalletOutlined />
              Connect Internet Identity
            </Space>
          ),
          onClick: login,
        }
      ],
    },
  ];
  
  return (
    <Dropdown 
      menu={{ items: menuItems, style: { minWidth: 320 } }} 
      trigger={['click']} 
      placement="bottomRight"
    >
      <Button icon={<WalletOutlined />} type={connectedCount > 0 ? 'primary' : 'default'}>
        <Space size={4}>
          <span className="wallet-text">Wallets</span>
          {connectedCount > 0 && (
            <Tag color="green" style={{ margin: 0, fontSize: 11, padding: '0 4px' }}>
              {connectedCount}
            </Tag>
          )}
        </Space>
      </Button>
    </Dropdown>
  );
}
