'use client';

import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import toast from 'react-hot-toast';
import { Card, Descriptions, Tag, Button, Space, Typography, Alert, Spin, Empty } from 'antd';
import { CheckCircleOutlined, WarningOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { CONTRACTS, AI_ORACLE_ABI } from '@/lib/contracts';

const { Title, Text, Paragraph } = Typography;

interface MarketDetailsProps {
  questionId: string;
}

export function MarketDetails({ questionId }: MarketDetailsProps) {
  const [isDisputing, setIsDisputing] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Read market data
  const { data: marketData, isLoading: isLoadingMarket } = useReadContract({
    address: CONTRACTS.AI_ORACLE,
    abi: AI_ORACLE_ABI,
    functionName: 'getMarket',
    args: [questionId as `0x${string}`],
  });

  // Read proposal data
  const { data: proposalData } = useReadContract({
    address: CONTRACTS.AI_ORACLE,
    abi: AI_ORACLE_ABI,
    functionName: 'getProposal',
    args: [questionId as `0x${string}`],
  });

  // Read dispute bond
  const { data: disputeBond } = useReadContract({
    address: CONTRACTS.AI_ORACLE,
    abi: AI_ORACLE_ABI,
    functionName: 'disputeBond',
  });

  const { writeContract: disputeWrite, data: disputeHash } = useWriteContract();
  const { writeContract: finalizeWrite, data: finalizeHash } = useWriteContract();

  const { isLoading: isDisputeConfirming } = useWaitForTransactionReceipt({
    hash: disputeHash,
  });

  const { isLoading: isFinalizeConfirming } = useWaitForTransactionReceipt({
    hash: finalizeHash,
  });

  if (isLoadingMarket) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!marketData) {
    return (
      <Card>
        <Empty description="Market not found" />
      </Card>
    );
  }

  const market = marketData as any;
  const proposal = proposalData as any;

  const resolutionDate = new Date(Number(market.resolutionTime) * 1000);
  const livenessPeriodSeconds = Number(market.livenessPeriod);
  const proposalTime = proposal?.exists
    ? new Date(Number(proposal.proposalTime) * 1000)
    : null;
  const livenessExpiry = proposalTime
    ? new Date(proposalTime.getTime() + livenessPeriodSeconds * 1000)
    : null;

  const canDispute =
    proposal?.exists &&
    !market.resolved &&
    !market.disputed &&
    livenessExpiry &&
    Date.now() < livenessExpiry.getTime();

  const canFinalize =
    proposal?.exists &&
    !market.resolved &&
    !market.disputed &&
    livenessExpiry &&
    Date.now() >= livenessExpiry.getTime();

  const handleDispute = async () => {
    try {
      setIsDisputing(true);
      toast.loading('Disputing resolution...', { id: 'dispute' });

      disputeWrite({
        address: CONTRACTS.AI_ORACLE,
        abi: AI_ORACLE_ABI,
        functionName: 'disputeResolution',
        args: [questionId as `0x${string}`],
        value: disputeBond as bigint,
      });
    } catch (error: any) {
      console.error('Error disputing:', error);
      toast.error(error.message || 'Failed to dispute', { id: 'dispute' });
      setIsDisputing(false);
    }
  };

  const handleFinalize = async () => {
    try {
      setIsFinalizing(true);
      toast.loading('Finalizing market...', { id: 'finalize' });

      finalizeWrite({
        address: CONTRACTS.AI_ORACLE,
        abi: AI_ORACLE_ABI,
        functionName: 'finalizeMarket',
        args: [questionId as `0x${string}`],
      });
    } catch (error: any) {
      console.error('Error finalizing:', error);
      toast.error(error.message || 'Failed to finalize', { id: 'finalize' });
      setIsFinalizing(false);
    }
  };

  const getStatusTag = () => {
    if (market.resolved) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>Finalized</Tag>;
    }
    if (market.disputed) {
      return <Tag color="error" icon={<WarningOutlined />}>Disputed</Tag>;
    }
    if (proposal?.exists) {
      return <Tag color="warning">Proposed</Tag>;
    }
    return <Tag color="processing" icon={<ClockCircleOutlined />}>Pending</Tag>;
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Market Question */}
      <Card>
        <Title level={2} style={{ marginBottom: 24 }}>
          {market.question}
        </Title>

        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          <Descriptions.Item label="Resolution Time">
            {format(resolutionDate, 'PPpp')}
          </Descriptions.Item>
          <Descriptions.Item label="Liveness Period">
            {livenessPeriodSeconds / 3600} hours
          </Descriptions.Item>
          <Descriptions.Item label="Creator">
            <Text code>{market.creator.slice(0, 6)}...{market.creator.slice(-4)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {getStatusTag()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Proposal Details */}
      {proposal?.exists && (
        <Card title="AI Resolution Proposal">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">Proposed Outcome:</Text>
              <div style={{ marginTop: 8 }}>
                {proposal.outcome ? (
                  <Tag color="success" style={{ fontSize: 16, padding: '8px 16px' }}>YES</Tag>
                ) : (
                  <Tag color="error" style={{ fontSize: 16, padding: '8px 16px' }}>NO</Tag>
                )}
              </div>
            </div>

            <div>
              <Text type="secondary">Reasoning:</Text>
              <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                {proposal.reasoning}
              </Paragraph>
            </div>

            <div>
              <Text type="secondary">Sources:</Text>
              <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                {proposal.sources}
              </Paragraph>
            </div>

            <div>
              <Text type="secondary">Proposed At:</Text>
              <Text strong style={{ marginLeft: 8 }}>
                {proposalTime && format(proposalTime, 'PPpp')}
              </Text>
            </div>

            {livenessExpiry && !market.resolved && (
              <div>
                <Text type="secondary">Liveness Expires:</Text>
                <Text strong style={{ marginLeft: 8 }}>
                  {Date.now() < livenessExpiry.getTime()
                    ? `in ${formatDistanceToNow(livenessExpiry)}`
                    : formatDistanceToNow(livenessExpiry, { addSuffix: true })}
                </Text>
              </div>
            )}
          </Space>
        </Card>
      )}

      {/* Final Outcome */}
      {market.resolved && (
        <Alert
          message="Market Finalized"
          description={
            <div>
              Final Outcome:{' '}
              <Tag color={market.outcome ? 'success' : 'error'} style={{ fontSize: 18, padding: '8px 16px', marginLeft: 8 }}>
                {market.outcome ? 'YES' : 'NO'}
              </Tag>
            </div>
          }
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      )}

      {/* Disputed Status */}
      {market.disputed && (
        <Alert
          message="Market Disputed"
          description="This market has been disputed and escalated to UMA Oracle for final resolution."
          type="error"
          showIcon
          icon={<WarningOutlined />}
        />
      )}

      {/* Action Buttons */}
      <Space size="middle" style={{ width: '100%' }}>
        {canDispute && (
          <Button
            danger
            size="large"
            onClick={handleDispute}
            loading={isDisputing || isDisputeConfirming}
            style={{ flex: 1 }}
          >
            {isDisputing || isDisputeConfirming
              ? 'Disputing...'
              : `Dispute (${disputeBond ? Number(disputeBond) / 1e18 : '0'} BNB)`}
          </Button>
        )}

        {canFinalize && (
          <Button
            type="primary"
            size="large"
            onClick={handleFinalize}
            loading={isFinalizing || isFinalizeConfirming}
            style={{ flex: 1, background: '#52c41a', borderColor: '#52c41a' }}
          >
            {isFinalizing || isFinalizeConfirming
              ? 'Finalizing...'
              : 'Finalize Market'}
          </Button>
        )}
      </Space>
    </Space>
  );
}

