'use client';

import { use } from 'react';
import { Header } from '@/components/Header';
import { MarketDetails } from '@/components/MarketDetails';

export default function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <main style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <MarketDetails questionId={id} />
      </main>
    </div>
  );
}

