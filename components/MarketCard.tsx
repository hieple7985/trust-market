'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, Badge, Tag, Space, Typography, Alert } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { MarketWithProposal, MarketStatus } from '@/lib/types';

const { Title, Text } = Typography;

interface MarketCardProps {
  market: MarketWithProposal;
}

export function MarketCard({ market }: MarketCardProps) {
  const resolutionDate = new Date(Number(market.resolutionTime) * 1000);
  const isResolved = market.resolved;
  const isPending = !market.resolved && Date.now() < Number(market.resolutionTime) * 1000;
  const hasProposal = market.proposal?.exists;

  const getStatusTag = () => {
    if (isResolved) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>Finalized</Tag>;
    }
    if (market.disputed) {
      return <Tag color="error" icon={<WarningOutlined />}>Disputed</Tag>;
    }
    if (hasProposal) {
      return <Tag color="warning">Proposed</Tag>;
    }
    if (isPending) {
      return <Tag color="processing" icon={<ClockCircleOutlined />}>Pending</Tag>;
    }
    return <Tag color="default">Awaiting Resolution</Tag>;
  };

  const getOutcomeTag = () => {
    if (!isResolved) return null;
    return market.outcome ? (
      <Tag color="success" style={{ fontSize: 14, padding: '4px 12px' }}>YES</Tag>
    ) : (
      <Tag color="error" style={{ fontSize: 14, padding: '4px 12px' }}>NO</Tag>
    );
  };

  return (
    <Link href={`/markets/${market.questionId}`} style={{ textDecoration: 'none' }}>
      <Card hoverable>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Title level={4} style={{ margin: 0, flex: 1 }}>
              {market.question}
            </Title>
            {getStatusTag()}
          </div>

          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Resolution Time:</Text>
              <Text strong>
                {isPending
                  ? `in ${formatDistanceToNow(resolutionDate)}`
                  : formatDistanceToNow(resolutionDate, { addSuffix: true })}
              </Text>
            </div>

            {hasProposal && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Proposed Outcome:</Text>
                <Text strong>{market.proposal?.outcome ? 'YES' : 'NO'}</Text>
              </div>
            )}

            {isResolved && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">Final Outcome:</Text>
                {getOutcomeTag()}
              </div>
            )}
          </Space>

          {market.disputed && (
            <Alert
              message="This market has been disputed and escalated to UMA Oracle"
              type="error"
              showIcon
              icon={<WarningOutlined />}
            />
          )}
        </Space>
      </Card>
    </Link>
  );
}

