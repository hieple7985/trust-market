'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Layout, Menu, Space, Typography, Drawer, Button } from 'antd';
import { HomeOutlined, AppstoreOutlined, PlusCircleOutlined, MenuOutlined } from '@ant-design/icons';
import { ConnectWallet } from './ConnectWallet';
import { usePathname } from 'next/navigation';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export function Header() {
  const pathname = usePathname();
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
      key: '/create',
      icon: <PlusCircleOutlined />,
      label: <Link href="/create">Create</Link>,
    },
  ];

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
      }}>
        <Space size="small" style={{ flex: 1, height: '56px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Title level={4} style={{ margin: 0, color: '#1890ff', lineHeight: '56px', fontSize: '18px' }}>
              TrustMarket
            </Title>
          </Link>
          
          {/* Desktop Menu */}
          <Menu
            mode="horizontal"
            selectedKeys={[pathname || '']}
            items={menuItems}
            style={{
              border: 'none',
              background: 'transparent',
              minWidth: 250,
              lineHeight: '54px',
              display: 'none',
            }}
            className="desktop-menu"
          />
        </Space>

        {/* Desktop Wallet */}
        <div className="desktop-wallet">
          <ConnectWallet />
        </div>

        {/* Mobile Menu Button */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          className="mobile-menu-button"
          style={{ display: 'none' }}
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
          selectedKeys={[pathname || '']}
          items={menuItems}
          onClick={() => setDrawerVisible(false)}
          style={{ border: 'none' }}
        />
        <div style={{ padding: 16, borderTop: '1px solid #f0f0f0' }}>
          <ConnectWallet />
        </div>
      </Drawer>

      <style jsx global>{`
        @media (min-width: 768px) {
          .desktop-menu {
            display: flex !important;
          }
          .desktop-wallet {
            display: block !important;
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

