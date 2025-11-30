'use client';

import { useState } from 'react';
import { Card, Button, Input, DatePicker, Space, Typography, Spin, Alert } from 'antd';
import { useICPAuth, useICPMarkets } from '@/hooks/useICP';
import { convertToNanoseconds } from '@/lib/icp-service';
import type { Dayjs } from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export function ICPCreateForm() {
  const { authenticated, principal, login, logout, loading: authLoading } = useICPAuth();
  const { createMarket } = useICPMarkets();
  
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [resolutionDate, setResolutionDate] = useState<Dayjs | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreateMarket = async () => {
    if (!question || !description || !resolutionDate) {
      alert('Please fill all fields');
      return;
    }

    try {
      setCreating(true);
      const resolutionTime = convertToNanoseconds(resolutionDate.toDate());
      const marketId = await createMarket(question, description, resolutionTime);
      alert(`Market created! ID: ${marketId}`);
      setQuestion('');
      setDescription('');
      setResolutionDate(null);
    } catch (error) {
      console.error('Failed to create market:', error);
      alert('Failed to create market');
    } finally {
      setCreating(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading ICP Authentication...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Card style={{ textAlign: 'center' }}>
        <Title level={4}>Connect to Internet Computer</Title>
        <Paragraph style={{ color: '#666' }}>
          Login with Internet Identity to create prediction markets on ICP.
        </Paragraph>
        <Button type="primary" size="large" onClick={login}>
          Login with Internet Identity
        </Button>
      </Card>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        type="success"
        showIcon
        message={
          <span>
            Connected: <Text code>{principal?.toString().slice(0, 10)}...{principal?.toString().slice(-8)}</Text>
            <Button type="link" size="small" onClick={logout} style={{ marginLeft: 8 }}>
              Logout
            </Button>
          </span>
        }
      />

      <Card title="Create New ICP Market">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Question *</Text>
            <Input
              placeholder="e.g., Will Bitcoin reach $100k by end of 2024?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{ marginTop: 8 }}
              size="large"
            />
          </div>
          
          <div>
            <Text strong>Description *</Text>
            <TextArea
              placeholder="Provide details about the market resolution criteria"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ marginTop: 8 }}
            />
          </div>
          
          <div>
            <Text strong>Resolution Date *</Text>
            <br />
            <DatePicker
              showTime
              value={resolutionDate}
              onChange={setResolutionDate}
              style={{ marginTop: 8, width: '100%' }}
              size="large"
              placeholder="Select resolution date and time"
            />
          </div>
          
          <Button
            type="primary"
            size="large"
            onClick={handleCreateMarket}
            loading={creating}
            disabled={!question || !description || !resolutionDate}
            block
          >
            Create Market on ICP
          </Button>
        </Space>
      </Card>
    </Space>
  );
}

export default ICPCreateForm;
