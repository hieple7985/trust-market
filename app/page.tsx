'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { Typography, Card, Row, Col, Space, Button, Tag, Statistic } from 'antd';
import { ThunderboltOutlined, SafetyOutlined, LineChartOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <main style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          {/* Hero Badge */}
          <div style={{ padding: '24px 0' }}>
            <Tag color="blue" icon={<TrophyOutlined />} style={{ fontSize: 14, padding: '8px 16px', marginBottom: 24 }}>
              The ONLY with UMA
            </Tag>
            <Title level={1} style={{ fontSize: 48, marginBottom: 16 }}>
              AI Speed + Economic Security
            </Title>
            <Title level={3} style={{ fontWeight: 400, color: '#666', marginBottom: 8 }}>
              5-minute AI resolution with $1M+ UMA backstop
            </Title>
            <Paragraph style={{ fontSize: 18, color: '#999', marginBottom: 48 }}>
              GPT-4 proposes outcomes fast. UMA guarantees they're correct.
            </Paragraph>
          </div>

          {/* Feature Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
            <Col xs={24} md={8}>
              <Card
                hoverable
                style={{ height: '100%', borderColor: '#1890ff' }}
                styles={{ body: { textAlign: 'center', padding: 32 } }}
              >
                <ThunderboltOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                <Title level={4}>AI Speed</Title>
                <Paragraph style={{ color: '#666' }}>
                  GPT-4 resolves markets in 5 minutes with 95% confidence scoring
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                hoverable
                style={{ height: '100%', borderColor: '#52c41a' }}
                styles={{ body: { textAlign: 'center', padding: 32 } }}
              >
                <SafetyOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                <Title level={4}>Economic Security</Title>
                <Paragraph style={{ color: '#666' }}>
                  UMA's $1M+ bond backstop guarantees correct resolutions
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                hoverable
                style={{ height: '100%', borderColor: '#722ed1' }}
                styles={{ body: { textAlign: 'center', padding: 32 } }}
              >
                <LineChartOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
                <Title level={4}>Full Transparency</Title>
                <Paragraph style={{ color: '#666' }}>
                  See confidence scores, reasoning, and cited data sources
                </Paragraph>
              </Card>
            </Col>
          </Row>

          {/* Stats */}
          <Row gutter={[24, 24]} style={{ marginBottom: 48, maxWidth: 800, margin: '0 auto 48px' }}>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="AI Resolution"
                  value="5 min"
                  valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="UMA Backstop"
                  value="$1M+"
                  valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Test Coverage"
                  value="96%"
                  valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>

          {/* CTA Buttons */}
          <Space size="large">
            <Link href="/create">
              <Button type="primary" size="large" style={{ height: 48, padding: '0 32px', fontSize: 16 }}>
                Create Market
              </Button>
            </Link>
            <Link href="/markets">
              <Button size="large" style={{ height: 48, padding: '0 32px', fontSize: 16 }}>
                Browse Markets
              </Button>
            </Link>
          </Space>
        </div>
      </main>
    </div>
  );
}
