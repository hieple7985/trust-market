'use client';

import { Tag } from 'antd';

type Chain = 'bnb' | 'icp';

interface ChainBadgeProps {
  chain: Chain;
  size?: 'small' | 'default';
}

export function ChainBadge({ chain, size = 'default' }: ChainBadgeProps) {
  const config = {
    bnb: {
      icon: '🔶',
      color: 'gold',
      text: 'BNB Chain',
    },
    icp: {
      icon: '∞',
      color: 'blue',
      text: 'ICP',
    },
  };

  const { icon, color, text } = config[chain];

  return (
    <Tag
      color={color}
      style={{
        fontSize: size === 'small' ? 11 : 12,
        padding: size === 'small' ? '2px 6px' : '4px 8px',
        margin: 0,
      }}
    >
      <span style={{ marginRight: 4 }}>{icon}</span>
      {text}
    </Tag>
  );
}
