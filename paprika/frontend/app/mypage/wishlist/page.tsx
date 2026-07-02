'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { WishListItem } from '@/types';
import Pagination from '@/components/mypage/Pagination';
import styles from '../page.module.css';

const PAGE_SIZE = 10;

export default function WishlistPage() {
  const [items, setItems] = useState<WishListItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchWishlist = () => {
    api.get(`/api/v1/users/me/wishlist?page=${page}&size=${PAGE_SIZE}`)
      .then((res) => {
        const fetchedTotalPages = res.data.data.totalPages;
        if (page > 0 && page >= fetchedTotalPages) {
          setPage(fetchedTotalPages - 1);
          return;
        }
        setItems(res.data.data.content);
        setTotalPages(fetchedTotalPages);
      })
      .catch(() => setItems([]));
  };

  useEffect(() => {
    fetchWishlist();
  }, [page]);

  return (
    <section>
      <h1 className={styles.title}>관심 상품</h1>

      {items.length === 0 ? (
        <div className={styles.empty}>찜한 상품이 없습니다.</div>
      ) : (
        <>
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.id} className={styles.card}>
              <img src={item.imgUrl} alt="상품" className={styles.cardImg} />
              <div className={styles.cardInfo}>
                <p className={styles.cardTitle}>{item.title}</p>
              </div>
              <button
                onClick={() => {
                  api.delete(`/api/v1/users/me/wishlist/${item.productId}`)
                    .then(() => {
                      if (items.length === 1 && page > 0) {
                        setPage((p) => p - 1);
                      } else {
                        fetchWishlist();
                      }
                    })
                    .catch(console.error);
                }}
                className={styles.wishBtn}
              >
                찜 해제
              </button>
            </div>
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}