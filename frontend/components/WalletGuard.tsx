'use client';

import { useAccount, useChainId } from 'wagmi';
import { Alert, Button, Space, Typography } from 'antd';
import { WalletOutlined, WarningOutlined } from '@ant-design/icons';
import { bscTestnet } from 'wagmi/chains';
import { ConnectWallet } from './ConnectWallet';

const { Title, Paragraph } = Typography;

interface WalletGuardProps {
  children: React.ReactNode;
  requireConnection?: boolean;
  requireCorrectNetwork?: boolean;
}

export function WalletGuard({
  children,
  requireConnection = true,
  requireCorrectNetwork = true,
}: WalletGuardProps) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();

  // Check if wallet is connected
  if (requireConnection && !isConnected) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '48px 24px',
        maxWidth: 600,
        margin: '0 auto'
      }}>
        {/* MetaMask Logo */}
        <div style={{ marginBottom: 24 }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
            alt="MetaMask"
            style={{ width: 80, height: 80 }}
          />
        </div>
        
        <Title level={3}>Connect Your Wallet</Title>
        <Paragraph style={{ fontSize: 16, color: '#666', marginBottom: 32 }}>
          You need to connect your wallet to create a prediction market.
          Please connect your MetaMask or other Web3 wallet to continue.
        </Paragraph>
        
        {/* Center the Connect Wallet button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ConnectWallet />
        </div>
      </div>
    );
  }

  // Check if on correct network
  if (requireCorrectNetwork && isConnected && chainId !== bscTestnet.id) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '48px 24px',
        maxWidth: 600,
        margin: '0 auto'
      }}>
        {/* BNB Chain Logo */}
        <div style={{ marginBottom: 24 }}>
          <img 
            src="https://cryptologos.cc/logos/bnb-bnb-logo.svg"
            alt="BNB Chain"
            style={{ width: 80, height: 80 }}
          />
        </div>
        
        <Title level={3}>Wrong Network</Title>
        <Paragraph style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
          You are currently connected to the wrong network.
          This application only works on <strong>BNB Smart Chain Testnet</strong>.
        </Paragraph>
        
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 24, textAlign: 'left' }}
          message="Network Mismatch"
          description={
            <Space direction="vertical" size="small">
              <div>
                <strong>Current Network:</strong> {chainId ? `Chain ID ${chainId}` : 'Unknown'}
              </div>
              <div>
                <strong>Required Network:</strong> BNB Smart Chain Testnet (Chain ID 97)
              </div>
            </Space>
          }
        />

        <Space direction="vertical" size="middle" style={{ width: '100%', alignItems: 'center' }}>
          <Paragraph style={{ fontSize: 14, color: '#666', marginBottom: 0 }}>
            Please switch to BNB Testnet in your wallet, or click the button below:
          </Paragraph>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ConnectWallet />
          </div>
        </Space>

        <Alert
          type="info"
          showIcon
          style={{ marginTop: 32, textAlign: 'left' }}
          message="How to Switch Networks"
          description={
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li>Open your MetaMask wallet</li>
              <li>Click on the network dropdown at the top</li>
              <li>Select "BNB Smart Chain Testnet"</li>
              <li>If not available, add it manually with Chain ID: 97</li>
            </ol>
          }
        />
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}
