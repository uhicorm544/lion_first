'use client';

/**
 * [임시/테스트] 상품 목록 페이지 — GET /api/v1/products (페이징)
 * 담당: C - 한대천 (테스트용)
 *
 * 실제 상품 목록/홈은 B/A 담당. 이 페이지는 채팅 테스트용 products 도메인 연동 확인용이다.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface ProductItem {
  id: number;
  sellerId: number;
  title: string;
  price: number;
  status: string;
  category: string | null;
  thumbnailUrl: string | null;
  viewCount: number;
  createdAt: string;
}

// 백엔드 Spring Page 응답 형태
interface PageResponse {
  content: ProductItem[];
  totalPages: number;
  totalElements: number;
  number: number; // 현재 페이지 (0-based)
  first: boolean;
  last: boolean;
}

const SIZE = 12;

export default function ProductsTestPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get(`/api/v1/products?page=${page}&size=${SIZE}`)
      .then((res) => {
        if (!cancelled) setData(res.data.data);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.response?.data?.message ?? '상품 목록을 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>상품 목록 (테스트)</h1>
        <Link
          href="/products/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            borderRadius: 18,
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary, #fff)',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          + 상품 등록
        </Link>
      </div>

      {loading && <p>불러오는 중…</p>}
      {error && <p style={{ color: 'var(--color-error)' }}>{error}</p>}

      {data && (
        <>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14 }}>
            전체 {data.totalElements}건 · {data.number + 1}/{data.totalPages || 1} 페이지
          </p>

          {data.content.length === 0 ? (
            <p>상품이 없습니다.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
              {data.content.map((p) => (
                <li
                  key={p.id}
                  style={{
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 12,
                  }}
                >
                  <Link
                    href={`/products/${p.id}`}
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                      padding: 16,
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <strong>{p.title}</strong>
                      <div style={{ color: 'var(--color-on-surface-variant)', fontSize: 13 }}>
                        #{p.id} · {p.category ?? '기타'} · {p.status} · 조회 {p.viewCount}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {p.price?.toLocaleString()}원
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* 페이징 */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
            <button
              type="button"
              disabled={data.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              ← 이전
            </button>
            <span style={{ alignSelf: 'center' }}>
              {data.number + 1} / {data.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
            >
              다음 →
            </button>
          </div>
        </>
      )}
    </main>
  );
}
