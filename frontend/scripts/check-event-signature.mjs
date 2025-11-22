import { keccak256, toHex } from 'viem';

// Event signature from blockchain
const actualSignature = '0xc0191c80c536991ffccf2914174633eff80febf92065b348edf2149c26ef363b';

// Calculate expected signature from ABI
const eventString = 'MarketCreated(bytes32,string,uint256,uint256)';
const expectedSignature = keccak256(toHex(eventString));

console.log('🔍 Event Signature Analysis');
console.log('='.repeat(80));
console.log('');
console.log('Expected (from ABI):');
console.log('  Event string:', eventString);
console.log('  Signature:   ', expectedSignature);
console.log('');
console.log('Actual (from blockchain):');
console.log('  Signature:   ', actualSignature);
console.log('');
console.log('Match:', expectedSignature === actualSignature ? '✅ YES' : '❌ NO');
console.log('');

if (expectedSignature !== actualSignature) {
  console.log('❌ MISMATCH DETECTED!');
  console.log('');
  console.log('Possible reasons:');
  console.log('1. Contract was redeployed with different event signature');
  console.log('2. ABI is outdated');
  console.log('3. Wrong event name or parameters');
  console.log('');
  console.log('Need to check actual contract source code or get updated ABI!');
}
