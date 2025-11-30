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
      <main style={{ padding: '32px 16px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          {/* Hero Badge */}
          <div style={{ padding: '16px 0' }}>
            <Tag color="blue" icon={<TrophyOutlined />} style={{ fontSize: 12, padding: '6px 12px', marginBottom: 16 }}>
              The ONLY with UMA
            </Tag>
            <Title level={1} className="hero-title" style={{ fontSize: 32, marginBottom: 12 }}>
              AI Speed + Economic Security
            </Title>
            <Title level={3} className="hero-subtitle" style={{ fontWeight: 400, color: '#666', marginBottom: 8, fontSize: 18 }}>
              5-minute AI resolution with $1M+ UMA backstop
            </Title>
            <Paragraph className="hero-description" style={{ fontSize: 16, color: '#999', marginBottom: 32 }}>
              GPT-4 proposes outcomes fast. UMA guarantees they're correct.
            </Paragraph>
          </div>

          {/* Feature Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            <Col xs={24} md={8}>
              <Card
                hoverable
                style={{ height: '100%', borderColor: '#1890ff' }}
                styles={{ body: { textAlign: 'center', padding: 24 } }}
              >
                <ThunderboltOutlined className="feature-icon" style={{ fontSize: 40, color: '#1890ff', marginBottom: 12 }} />
                <Title level={4} style={{ fontSize: 18 }}>AI Speed</Title>
                <Paragraph style={{ color: '#666', fontSize: 14 }}>
                  GPT-4 resolves markets in 5 minutes with 95% confidence scoring
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                hoverable
                style={{ height: '100%', borderColor: '#52c41a' }}
                styles={{ body: { textAlign: 'center', padding: 24 } }}
              >
                <SafetyOutlined className="feature-icon" style={{ fontSize: 40, color: '#52c41a', marginBottom: 12 }} />
                <Title level={4} style={{ fontSize: 18 }}>Economic Security</Title>
                <Paragraph style={{ color: '#666', fontSize: 14 }}>
                  UMA's $1M+ bond backstop guarantees correct resolutions
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                hoverable
                style={{ height: '100%', borderColor: '#722ed1' }}
                styles={{ body: { textAlign: 'center', padding: 24 } }}
              >
                <LineChartOutlined className="feature-icon" style={{ fontSize: 40, color: '#722ed1', marginBottom: 12 }} />
                <Title level={4} style={{ fontSize: 18 }}>Full Transparency</Title>
                <Paragraph style={{ color: '#666', fontSize: 14 }}>
                  See confidence scores, reasoning, and cited data sources
                </Paragraph>
              </Card>
            </Col>
          </Row>

          {/* Supported Chains */}
          <Card style={{ marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
            <Title level={5} style={{ marginBottom: 16, color: '#666' }}>Powered by</Title>
            <Row gutter={[32, 16]} justify="center" align="middle">
              <Col>
                <Space direction="vertical" align="center" size={8}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F0B90B 0%, #F8D12F 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(240, 185, 11, 0.3)',
                  }}>
                    <span style={{ fontSize: 32, fontWeight: 'bold', color: '#fff' }}>B</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#333' }}>BNB Chain</span>
                  <Tag color="gold">EVM</Tag>
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" align="center" size={8}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #29ABE2 0%, #522785 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(82, 39, 133, 0.3)',
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 'bold', color: '#fff' }}>∞</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#333' }}>Internet Computer</span>
                  <Tag color="purple">ICP</Tag>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 32, maxWidth: 800, margin: '0 auto 32px' }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="AI Resolution"
                  value="5 min"
                  valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="UMA Backstop"
                  value="$1M+"
                  valueStyle={{ color: '#52c41a', fontWeight: 'bold', fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Test Coverage"
                  value="96%"
                  valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
                />
              </Card>
            </Col>
          </Row>

          {/* CTA Buttons */}
          <Space size="middle" direction="vertical" style={{ width: '100%', maxWidth: 400 }} className="cta-buttons">
            <Link href="/create" style={{ width: '100%' }}>
              <Button type="primary" size="large" block style={{ height: 44, fontSize: 16 }}>
                Create Market
              </Button>
            </Link>
            <Link href="/markets" style={{ width: '100%' }}>
              <Button size="large" block style={{ height: 44, fontSize: 16 }}>
                Browse Markets
              </Button>
            </Link>
          </Space>
        </div>
      </main>

      <style jsx global>{`
        @media (min-width: 768px) {
          .hero-title {
            font-size: 48px !important;
          }
          .hero-subtitle {
            font-size: 24px !important;
          }
          .hero-description {
            font-size: 18px !important;
          }
          .feature-icon {
            font-size: 48px !important;
          }
          .cta-buttons {
            flex-direction: row !important;
            width: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
