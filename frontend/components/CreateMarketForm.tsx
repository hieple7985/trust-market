'use client';

import { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Select, Button, Alert, Typography } from 'antd';
import { ClockCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import toast from 'react-hot-toast';
import { CONTRACTS, AI_ORACLE_ABI } from '@/lib/contracts';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Paragraph } = Typography;

export function CreateMarketForm() {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const onFinish = async (values: any) => {
    try {
      setIsSubmitting(true);

      // Convert datetime to timestamp
      const resolutionTimestamp = Math.floor(values.resolutionDateTime.unix());
      const livenessPeriod = parseInt(values.livenessPeriod);

      toast.loading('Creating market...', { id: 'create-market' });

      writeContract({
        address: CONTRACTS.AI_ORACLE,
        abi: AI_ORACLE_ABI,
        functionName: 'createMarket',
        args: [values.question, BigInt(resolutionTimestamp), BigInt(livenessPeriod)],
      });
    } catch (error: any) {
      console.error('Error creating market:', error);
      toast.error(error.message || 'Failed to create market', {
        id: 'create-market',
      });
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isConfirming) {
      toast.loading('Waiting for confirmation...', { id: 'create-market' });
    }

    if (isSuccess) {
      toast.success('Market created successfully!', { id: 'create-market' });
      form.resetFields();
      setIsSubmitting(false);
    }
  }, [isConfirming, isSuccess, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
      size="large"
    >
      <Form.Item
        label="Market Question"
        name="question"
        rules={[
          { required: true, message: 'Please enter a question' },
          { min: 10, message: 'Question must be at least 10 characters' },
          { max: 200, message: 'Question must be less than 200 characters' },
        ]}
        tooltip="Ask a clear yes/no question that can be objectively verified"
      >
        <Input
          prefix={<QuestionCircleOutlined />}
          placeholder="Will Bitcoin reach $100,000 by the end of 2025?"
        />
      </Form.Item>

      <Form.Item
        label="Resolution Date & Time"
        name="resolutionDateTime"
        rules={[
          { required: true, message: 'Please select resolution date and time' },
          {
            validator: (_, value) => {
              if (value && value.isAfter(dayjs())) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Resolution time must be in the future'));
            },
          },
        ]}
        tooltip="When should the AI resolve this market?"
      >
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          style={{ width: '100%' }}
          disabledDate={(current) => current && current < dayjs().startOf('day')}
        />
      </Form.Item>

      <Form.Item
        label="Liveness Period (Challenge Window)"
        name="livenessPeriod"
        rules={[{ required: true, message: 'Please select a liveness period' }]}
        tooltip="Time window for users to dispute the AI's resolution"
      >
        <Select
          placeholder="Select liveness period"
          options={[
            { value: '3600', label: '1 hour' },
            { value: '7200', label: '2 hours' },
            { value: '14400', label: '4 hours' },
            { value: '86400', label: '24 hours' },
          ]}
        />
      </Form.Item>

      <Alert
        message="How it works:"
        description={
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            <li>Your market will be created on-chain</li>
            <li>AI bot will automatically resolve it after the resolution time</li>
            <li>Users can dispute the resolution during the liveness period</li>
            <li>If disputed, the market escalates to UMA Oracle</li>
            <li>After liveness expires, anyone can finalize the market</li>
          </ol>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting || isConfirming}
          block
          size="large"
        >
          {isSubmitting || isConfirming ? 'Creating Market...' : 'Create Market'}
        </Button>
      </Form.Item>
    </Form>
  );
}

