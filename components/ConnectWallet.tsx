'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function ConnectWallet() {
  return (
    <ConnectButton
      chainStatus="icon"
      accountStatus="address"
      showBalance={false}
    />
  );
}

