'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Transaction {
  id: number;
  postId: number;
  type: string;
  status: string;
  myRole: string;
  itemPrice: number;
  amount: number;
  createdAt: string;
  imgUrl: string;
}

const statusLabels: Record<string, string> = {
  PENDING: '거래 요청',
  AGREED: '거래 확정',
  COMPLETED: '거래 완료',
  CANCELLED: '거래 취소',
};

export default function SellPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    api.get('/api/v1/users/me/transactions?tab=sell')
      .then((res) => setTransactions(res.data.data))
      .catch(() => setTransactions([]));
  }, []);

  return (
    <section>
      <h1 style={{ marginBottom: 24 }}>판매내역</h1>

      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-on-surface-variant)' }}>
          판매 내역이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {transactions.map((t) => (
            <div key={t.id} style={{ padding: 16, borderRadius: 12, background: 'var(--color-surface-container-lowest)', display: 'flex', gap: 16, alignItems: 'center', boxShadow: 'var(--shadow-card)' }}>
              <img src={t.imgUrl} alt="상품" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>상품 #{t.postId}</p>
                <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                  {t.type === 'DIRECT' ? '직거래' : '택배'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{t.amount.toLocaleString()}원</p>
                <p style={{ fontSize: 13, color: 'var(--color-secondary)' }}>{statusLabels[t.status]}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}