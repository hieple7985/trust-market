'use client';

import { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { Card, Button, Space, Typography, Progress } from 'antd';

const { Title, Text, Paragraph } = Typography;

const CONTRACT_ADDRESS = '0x9f4c64c9dd9B086e31a600E56aBB3095394f1508';

export default function TestRPCPage() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const publicClient = usePublicClient();

  const addLog = (msg: string) => {
    setResults(prev => [...prev, msg]);
    console.log(msg);
  };

  const testRange = async (blockRange: number): Promise<boolean> => {
    if (!publicClient) return false;
    
    try {
      const latestBlock = await publicClient.getBlockNumber();
      const fromBlock = latestBlock - BigInt(blockRange);
      
      addLog(`\n🔍 Testing ${blockRange.toLocaleString()} blocks...`);
      addLog(`   From: ${fromBlock.toString()}`);
      addLog(`   To: ${latestBlock.toString()}`);
      
      const startTime = Date.now();
      
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS as `0x${string}`,
        fromBlock,
        toBlock: latestBlock,
      });
      
      const duration = Date.now() - startTime;
      
      addLog(`   ✅ SUCCESS! Found ${logs.length} events in ${duration}ms`);
      return true;
    } catch (error: any) {
      const errorMsg = error.details || error.shortMessage || error.message || 'Unknown error';
      addLog(`   ❌ FAILED: ${errorMsg}`);
      return false;
    }
  };

  const runTest = async () => {
    if (!publicClient) {
      addLog('❌ Public client not ready');
      return;
    }

    setTesting(true);
    setResults([]);
    setProgress(0);

    addLog('🚀 Starting RPC Limit Test');
    addLog('📝 Contract: ' + CONTRACT_ADDRESS);
    addLog('='.repeat(60));

    const testRanges = [10, 50, 100, 200, 500, 1000, 1500, 2000, 3000, 5000, 10000];
    
    let maxWorking = 0;
    let minFailing = Infinity;

    for (let i = 0; i < testRanges.length; i++) {
      const range = testRanges[i];
      const success = await testRange(range);
      
      if (success) {
        maxWorking = range;
      } else {
        minFailing = Math.min(minFailing, range);
        break;
      }
      
      setProgress(Math.round(((i + 1) / testRanges.length) * 100));
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    addLog('\n' + '='.repeat(60));
    addLog('📊 FINAL RESULTS:');
    addLog(`   ✅ Max working: ${maxWorking.toLocaleString()} blocks`);
    if (minFailing !== Infinity) {
      addLog(`   ❌ Min failing: ${minFailing.toLocaleString()} blocks`);
      addLog(`   📍 Limit is between ${maxWorking.toLocaleString()} and ${minFailing.toLocaleString()} blocks`);
    }
    
    const hours = (maxWorking * 3) / 3600;
    addLog(`   ⏰ Coverage: ~${hours.toFixed(1)} hours`);
    addLog('='.repeat(60));

    setTesting(false);
    setProgress(100);
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>🧪 RPC Block Range Limit Test</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Paragraph>
              This test will find the maximum block range that the RPC endpoint allows for <code>eth_getLogs</code> queries.
            </Paragraph>
            <Paragraph>
              <strong>Contract:</strong> <code>{CONTRACT_ADDRESS}</code>
            </Paragraph>
            <Paragraph>
              <strong>RPC:</strong> BNB Testnet (from wagmi config)
            </Paragraph>
          </div>

          <Button 
            type="primary" 
            size="large" 
            onClick={runTest} 
            loading={testing}
            disabled={!publicClient}
          >
            {testing ? 'Testing...' : 'Start Test'}
          </Button>

          {testing && <Progress percent={progress} status="active" />}
        </Space>
      </Card>

      {results.length > 0 && (
        <Card title="Test Results">
          <pre style={{ 
            background: '#000', 
            color: '#0f0', 
            padding: 16, 
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'monospace',
            maxHeight: 600,
            overflow: 'auto'
          }}>
            {results.join('\n')}
          </pre>
        </Card>
      )}
    </div>
  );
}
