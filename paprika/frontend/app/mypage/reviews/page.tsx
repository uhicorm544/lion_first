'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Review } from '@/types';
import Pagination from '@/components/mypage/Pagination';
import styles from '../page.module.css';

const PAGE_SIZE = 10;

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className={styles.stars}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    api.get('/api/v1/users/me')
      .then((res) => {
        const userId = res.data.id;
        return api.get(`/api/v1/users/${userId}/reviews?page=${page}&size=${PAGE_SIZE}`);
      })
      .then((res) => {
        const fetchedTotalPages = res.data.data.totalPages;
        if (page > 0 && page >= fetchedTotalPages) {
          setPage(fetchedTotalPages - 1);
          return;
        }
        setReviews(res.data.data.content);
        setTotalPages(fetchedTotalPages);
      })
      .catch(() => setReviews([]));
  }, [page]);

  return (
    <section>
      <h1 className={styles.title}>거래 후기</h1>

      {reviews.length === 0 ? (
        <div className={styles.empty}>받은 후기가 없습니다.</div>
      ) : (
        <>
        <div className={styles.list}>
          {reviews.map((r) => (
            <div key={r.id} className={styles.reviewCard}>
              <StarDisplay rating={r.rating} />
              <p className={styles.content}>{r.content}</p>
              <p className={styles.meta}>
                {r.reviewerNickname ?? '알 수 없음'} · {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}