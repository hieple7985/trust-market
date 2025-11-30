'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Layout, Menu, Space, Typography, Drawer, Button } from 'antd';
import { HomeOutlined, AppstoreOutlined, PlusCircleOutlined, MenuOutlined } from '@ant-design/icons';
import { WalletDropdown } from './WalletDropdown';
import { ChainSelector } from './ChainSelector';
import { usePathname, useSearchParams } from 'next/navigation';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link href="/">Home</Link>,
    },
    {
      key: '/markets',
      icon: <AppstoreOutlined />,
      label: <Link href="/markets">Markets</Link>,
    },
    {
      key: '/create-bnb',
      icon: <PlusCircleOutlined />,
      label: <Link href="/create?chain=bnb">🔶 BNB · Create</Link>,
    },
    {
      key: '/create-icp',
      icon: <PlusCircleOutlined />,
      label: <Link href="/create?chain=icp">∞ ICP · Create</Link>,
    },
  ];

  let selectedKey = pathname || '';
  if (pathname === '/create') {
    const chain = searchParams?.get('chain');
    selectedKey = chain === 'icp' ? '/create-icp' : '/create-bnb';
  }

  return (
    <>
      <AntHeader style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 16px',
        height: '56px',
        lineHeight: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        gap: '16px',
      }}>
        {/* Left: Logo + Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <Title level={4} style={{ margin: 0, color: '#1890ff', lineHeight: '56px', fontSize: '18px', whiteSpace: 'nowrap' }}>
              TrustMarket
            </Title>
          </Link>
          
          {/* Desktop Menu */}
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{
              border: 'none',
              background: 'transparent',
              flex: 1,
              minWidth: 0,
              lineHeight: '54px',
            }}
            className="desktop-menu"
          />
        </div>

        {/* Right: Chain Selector + Wallet */}
        <div className="desktop-wallet" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <ChainSelector />
          <WalletDropdown />
        </div>

        {/* Mobile Menu Button */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          className="mobile-menu-button"
        />
      </AntHeader>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="vertical"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={() => setDrawerVisible(false)}
          style={{ border: 'none' }}
        />
        <div style={{ padding: 16, borderTop: '1px solid #f0f0f0' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <ChainSelector />
            <WalletDropdown />
          </Space>
        </div>
      </Drawer>

      <style jsx global>{`
        @media (min-width: 768px) {
          .desktop-menu {
            display: flex !important;
          }
          .desktop-wallet {
            display: flex !important;
          }
          .mobile-menu-button {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-menu {
            display: none !important;
          }
          .desktop-wallet {
            display: none !important;
          }
          .mobile-menu-button {
            display: inline-flex !important;
          }
        }
      `}</style>
    </>
  );
}

