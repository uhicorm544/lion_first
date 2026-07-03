'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import type { Product } from '@/types';
import styles from './page.module.css';

interface PageMeta {
  totalPages: number;
  totalElements: number;
  number: number;
  first: boolean;
  last: boolean;
}

const SIZE = 12;

export default function ProductsPage() {
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get('/api/v1/posts', { params: { page, size: SIZE, sort: 'createdAt,desc' } })
      .then((res) => {
        if (cancelled) return;
        const data = res.data.data;
        const mapped: Product[] = (data?.content ?? []).map((p: any) => ({
          id: p.id,
          sellerId: p.userId,
          sellerNickname: '',
          title: p.title,
          description: p.content ?? '',
          price: Number(p.currentPrice ?? 0),
          status: p.postStatus,
          category: p.category ?? '',
          location: '',
          imageUrls: p.thumbnailUrl ? [p.thumbnailUrl] : ['/images/product-placeholder.svg'],
          viewCount: p.viewCount ?? 0,
          wishCount: 0,
          createdAt: p.createdAt ?? '',
        }));
        setProducts(mapped);
        setMeta({
          totalPages: data?.totalPages ?? 1,
          totalElements: data?.totalElements ?? 0,
          number: data?.number ?? 0,
          first: data?.first ?? true,
          last: data?.last ?? true,
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.message ?? '상품 목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page]);

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1>상품 목록</h1>
        <Link href="/products/new" className={styles.newBtn}>+ 상품 등록</Link>
      </div>

      {meta && (
        <p className={styles.meta}>
          전체 {meta.totalElements}건 · {meta.number + 1} / {meta.totalPages || 1} 페이지
        </p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          {products.length === 0 ? (
            <p className={styles.empty}>등록된 상품이 없습니다.</p>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      )}

      {meta && (
        <div className={styles.pagination}>
          <button
            type="button"
            disabled={meta.first}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            ← 이전
          </button>
          <span>{meta.number + 1} / {meta.totalPages || 1}</span>
          <button
            type="button"
            disabled={meta.last}
            onClick={() => setPage((p) => p + 1)}
          >
            다음 →
          </button>
        </div>
      )}
    </main>
  );
}
