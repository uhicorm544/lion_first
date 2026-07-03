'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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

const CATEGORIES = [
  { value: '', label: '전체', icon: 'apps' },
  { value: 'ELECTRONICS', label: '전자기기', icon: 'devices' },
  { value: 'FASHION', label: '패션', icon: 'checkroom' },
  { value: 'HOME', label: '홈/생활', icon: 'home' },
  { value: 'KIDS', label: '유아', icon: 'toys' },
  { value: 'SPORTS', label: '스포츠', icon: 'sports_tennis' },
  { value: 'BOOKS', label: '도서', icon: 'menu_book' },
  { value: 'HOBBIES', label: '취미', icon: 'palette' },
  { value: 'OTHERS', label: '기타', icon: 'more_horiz' },
];

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState(() => searchParams.get('category') ?? '');
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL의 category 파라미터가 바뀌면 반영 (홈에서 넘어올 때)
  useEffect(() => {
    const urlCategory = searchParams.get('category') ?? '';
    setCategory(urlCategory);
    setPage(0);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params: Record<string, any> = { page, size: SIZE, sort: 'createdAt,desc' };
    if (category) params.category = category;
    api
      .get('/api/v1/posts', { params })
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
  }, [category, page]);

  function handleCategory(value: string) {
    setPage(0);
    if (value) {
      router.push(`/products?category=${value}`);
    } else {
      router.push('/products');
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1>상품 목록</h1>
        <Link href="/products/new" className={styles.newBtn}>+ 상품 등록</Link>
      </div>

      <div className={styles.categoryBar}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            className={`${styles.categoryChip} ${category === cat.value ? styles.active : ''}`}
            onClick={() => handleCategory(cat.value)}
          >
            <span className="material-symbols-outlined">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
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

// useSearchParams()는 Suspense 경계 안에서만 정적 빌드가 통과된다.
export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageInner />
    </Suspense>
  );
}
