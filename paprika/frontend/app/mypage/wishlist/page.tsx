'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface WishItem {
  id: number;
  productId: number;
  imgUrl: string;
  createdAt: string;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishItem[]>([]);

  useEffect(() => {
    api.get('/api/v1/users/me/wishlist')
      .then((res) => setItems(res.data.data))
      .catch(() => setItems([]));
  }, []);

  return (
    <section>
      <h1 style={{ marginBottom: 24 }}>관심 상품</h1>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-on-surface-variant)' }}>
          찜한 상품이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((item) => (
            <div key={item.id} style={{ padding: 16, borderRadius: 12, background: 'var(--color-surface-container-lowest)', display: 'flex', gap: 16, alignItems: 'center', boxShadow: 'var(--shadow-card)' }}>
              <img src={item.imgUrl} alt="상품" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>상품 #{item.productId}</p>
              </div>
              <button
                onClick={() => {
                  api.delete(`/api/v1/users/me/wishlist/${item.productId}`)
                    .then(() => setItems(prev => prev.filter(i => i.id !== item.id)))
                    .catch(console.error);
                }}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #eee', cursor: 'pointer', color: '#e53935', background: 'transparent' }}
              >
                찜 해제
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}