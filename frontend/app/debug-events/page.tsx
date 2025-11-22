'use client';

import { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { Card, Button, Typography, Space, Input } from 'antd';
import { CONTRACTS, AI_ORACLE_ABI } from '@/lib/contracts';

const { Title, Text, Paragraph } = Typography;

export default function DebugEventsPage() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  const [txHash, setTxHash] = useState('0x5706b91319753affe7d938b5bdfbaa02c723abc7fb158520ef9bf541375afd57');
  
  const publicClient = usePublicClient();

  const addLog = (msg: string) => {
    setResults(prev => [...prev, msg]);
    console.log(msg);
  };

  const testBlockLimit = async () => {
    if (!publicClient) {
      addLog('❌ Public client not ready');
      return;
    }

    setTesting(true);
    setResults([]);

    addLog('🔍 TESTING RPC BLOCK RANGE LIMIT');
    addLog('='.repeat(80));
    addLog('');

    try {
      const latestBlock = await publicClient.getBlockNumber();
      addLog(`📦 Latest block: ${latestBlock}`);
      addLog('');

      // Test different block ranges
      const testRanges = [100, 500, 1000, 2000, 3000, 5000, 10000];
      let maxWorking = 0;
      let minFailing = Infinity;

      for (const range of testRanges) {
        const fromBlock = latestBlock - BigInt(range);
        
        addLog(`🔎 Testing ${range.toLocaleString()} blocks...`);
        
        try {
          const startTime = Date.now();
          const events = await publicClient.getContractEvents({
            address: CONTRACTS.AI_ORACLE,
            abi: AI_ORACLE_ABI,
            eventName: 'MarketCreated',
            fromBlock,
            toBlock: latestBlock,
          });
          const duration = Date.now() - startTime;
          
          addLog(`   ✅ SUCCESS! Found ${events.length} events in ${duration}ms`);
          maxWorking = range;
        } catch (error: any) {
          const errorMsg = error.details || error.shortMessage || error.message || 'Unknown error';
          addLog(`   ❌ FAILED: ${errorMsg}`);
          minFailing = Math.min(minFailing, range);
          break; // Stop testing larger ranges
        }
        
        // Wait between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      addLog('');
      addLog('='.repeat(80));
      addLog('📊 RESULTS:');
      addLog(`   ✅ Max working: ${maxWorking.toLocaleString()} blocks`);
      if (minFailing !== Infinity) {
        addLog(`   ❌ Min failing: ${minFailing.toLocaleString()} blocks`);
        addLog(`   📍 Limit is between ${maxWorking.toLocaleString()} and ${minFailing.toLocaleString()} blocks`);
      } else {
        addLog(`   📍 All tested ranges work! Limit is > ${maxWorking.toLocaleString()} blocks`);
      }
      addLog('='.repeat(80));
      
    } catch (error: any) {
      addLog('');
      addLog('❌ ERROR:');
      addLog(error.message || String(error));
    }

    setTesting(false);
  };

  const debugTransaction = async () => {
    if (!publicClient) {
      addLog('❌ Public client not ready');
      return;
    }

    setTesting(true);
    setResults([]);

    addLog('🔍 DEBUGGING TRANSACTION');
    addLog('='.repeat(80));
    addLog(`TX Hash: ${txHash}`);
    addLog('');

    try {
      // 1. Get transaction receipt
      addLog('📝 Step 1: Getting transaction receipt...');
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });
      
      const latestBlock = await publicClient.getBlockNumber();
      const blockDiff = latestBlock - receipt.blockNumber;
      const hoursAgo = (Number(blockDiff) * 3) / 3600; // 3 sec per block
      
      addLog(`✅ Transaction found!`);
      addLog(`   Block: ${receipt.blockNumber}`);
      addLog(`   Latest block: ${latestBlock}`);
      addLog(`   Blocks ago: ${blockDiff}`);
      addLog(`   Time ago: ~${hoursAgo.toFixed(1)} hours`);
      addLog(`   Status: ${receipt.status === 'success' ? '✅ Success' : '❌ Failed'}`);
      addLog(`   Contract: ${receipt.to}`);
      addLog(`   Logs count: ${receipt.logs.length}`);
      addLog('');

      // 2. Check contract address
      addLog('📝 Step 2: Checking contract address...');
      addLog(`   Expected: ${CONTRACTS.AI_ORACLE}`);
      addLog(`   Actual:   ${receipt.to}`);
      addLog(`   Match: ${receipt.to?.toLowerCase() === CONTRACTS.AI_ORACLE.toLowerCase() ? '✅ YES' : '❌ NO'}`);
      addLog('');

      // 3. Parse all logs
      addLog('📝 Step 3: Parsing all logs...');
      receipt.logs.forEach((log, i) => {
        addLog(`   Log ${i + 1}:`);
        addLog(`      Address: ${log.address}`);
        addLog(`      Topics: ${log.topics.length}`);
        if (log.topics.length > 0) {
          addLog(`      Topic[0] (event sig): ${log.topics[0]}`);
        }
      });
      addLog('');

      // 4. Try to decode with ABI
      addLog('📝 Step 4: Decoding with ABI...');
      const marketCreatedEvent = AI_ORACLE_ABI.find(
        (item: any) => item.type === 'event' && item.name === 'MarketCreated'
      );
      
      if (marketCreatedEvent) {
        addLog(`   ✅ Found MarketCreated in ABI`);
        addLog(`   Event signature: ${JSON.stringify(marketCreatedEvent.inputs)}`);
      } else {
        addLog(`   ❌ MarketCreated not found in ABI!`);
      }
      addLog('');

      // 5. Try getContractEvents for this specific block
      addLog('📝 Step 5: Querying events from this block...');
      const events = await publicClient.getContractEvents({
        address: CONTRACTS.AI_ORACLE,
        abi: AI_ORACLE_ABI,
        eventName: 'MarketCreated',
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });
      
      addLog(`   Found ${events.length} MarketCreated events in block ${receipt.blockNumber}`);
      events.forEach((event: any, i) => {
        addLog(`   Event ${i + 1}:`);
        addLog(`      questionId: ${event.args.questionId}`);
        addLog(`      question: ${event.args.question}`);
        addLog(`      resolutionTime: ${event.args.resolutionTime}`);
        addLog(`      livenessPeriod: ${event.args.livenessPeriod}`);
      });
      addLog('');

      // 6. Try getLogs with raw event signature
      addLog('📝 Step 6: Trying getLogs with raw signature...');
      const logs = await publicClient.getLogs({
        address: CONTRACTS.AI_ORACLE,
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });
      
      addLog(`   Found ${logs.length} total logs from contract in this block`);
      addLog('');

      addLog('='.repeat(80));
      addLog('✅ DEBUG COMPLETE');
      
    } catch (error: any) {
      addLog('');
      addLog('❌ ERROR:');
      addLog(error.message || String(error));
      addLog('');
      addLog('Stack trace:');
      addLog(error.stack || 'No stack trace');
    }

    setTesting(false);
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>🔍 Debug Transaction Events</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Paragraph>
              This tool will analyze a specific transaction to debug why events are not being found.
            </Paragraph>
            <Paragraph>
              <strong>Contract:</strong> <code>{CONTRACTS.AI_ORACLE}</code>
            </Paragraph>
          </div>

          <div>
            <Text strong>Transaction Hash:</Text>
            <Input 
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x..."
              style={{ marginTop: 8 }}
            />
          </div>

          <Space>
            <Button 
              type="primary" 
              size="large" 
              onClick={debugTransaction} 
              loading={testing}
              disabled={!publicClient || !txHash}
            >
              {testing ? 'Debugging...' : 'Debug Transaction'}
            </Button>
            
            <Button 
              size="large" 
              onClick={testBlockLimit} 
              loading={testing}
              disabled={!publicClient}
            >
              {testing ? 'Testing...' : 'Test Block Limit'}
            </Button>
          </Space>
        </Space>
      </Card>

      {results.length > 0 && (
        <Card title="Debug Results">
          <pre style={{ 
            background: '#000', 
            color: '#0f0', 
            padding: 16, 
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'monospace',
            maxHeight: 600,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {results.join('\n')}
          </pre>
        </Card>
      )}
    </div>
  );
}
