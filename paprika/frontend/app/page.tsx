'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import type { Product } from '@/types';
import api from '@/lib/api';
import styles from './page.module.css';

const categoryItems = [
  { label: 'Electronics', icon: 'devices', value: 'ELECTRONICS' },
  { label: 'Fashion', icon: 'checkroom', value: 'FASHION' },
  { label: 'Home', icon: 'home', value: 'HOME' },
  { label: 'Kids', icon: 'toys', value: 'KIDS' },
  { label: 'Sports', icon: 'sports_tennis', value: 'SPORTS' },
  { label: 'Books', icon: 'menu_book', value: 'BOOKS' },
  { label: 'Hobbies', icon: 'palette', value: 'HOBBIES' },
  { label: 'Others', icon: 'more_horiz', value: 'OTHERS' },
];

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.get('/api/v1/posts', { params: { size: 8, sort: 'createdAt,desc' } })
      .then((res) => {
        const posts = res.data.data?.content ?? [];
        const mapped: Product[] = posts.map((p: any) => ({
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
          wishCount: p.wishCount ?? 0,
          createdAt: p.createdAt ?? '',
        }));
        setProducts(mapped);
      })
      .catch(() => {});
  }, []);

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.heroOverline}>Paprika</p>
          <h1 className={styles.heroTitle}>
            The neighborhood marketplace for <span>fresh finds.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Snap a photo, set a price, and sell to your neighbors in minutes. It&apos;s that easy.
          </p>
          <div className={styles.searchCard}>
            <span className="material-symbols-outlined">search</span>
            <input type="search" placeholder="Search for items near you..." />
            <button type="button">Search</button>
          </div>
          <p className={styles.trending}>Trending: Vintage Camera Coffee Table Nike Dunks Plants</p>
        </div>
      </section>

      <section className={styles.categoryGrid}>
        {categoryItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={styles.categoryItem}
            onClick={() => router.push(`/products?category=${item.value}`)}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </section>

      <section className={styles.cardSection}>
        <div className={styles.sectionHeader}>
          <h2>New Arrivals</h2>
          <Link href="/products" className={styles.viewAllBtn}>View All</Link>
        </div>
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
