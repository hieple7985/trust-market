'use client';

import Link from 'next/link';
import { Layout, Menu, Space, Typography } from 'antd';
import { HomeOutlined, AppstoreOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { ConnectWallet } from './ConnectWallet';
import { usePathname } from 'next/navigation';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export function Header() {
  const pathname = usePathname();

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
      label: <Link href="/create">Create Market</Link>,
    },
  ];

  return (
    <AntHeader style={{
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      padding: '0 24px',
      height: '56px',
      lineHeight: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <Space size="middle" style={{ flex: 1, height: '56px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff', lineHeight: '56px' }}>
            TrustMarket
          </Title>
        </Link>
        <Menu
          mode="horizontal"
          selectedKeys={[pathname || '']}
          items={menuItems}
          style={{
            border: 'none',
            background: 'transparent',
            minWidth: 300,
            lineHeight: '54px',
          }}
        />
      </Space>
      <ConnectWallet />
    </AntHeader>
  );
}

