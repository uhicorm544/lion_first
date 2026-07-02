'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { MyPageTransaction } from '@/types';
import Pagination from '@/components/mypage/Pagination';
import styles from '../page.module.css';

const PAGE_SIZE = 10;
const statusLabels: Record<string, string> = {
  PENDING: '거래 요청',
  AGREED: '거래 확정',
  COMPLETED: '거래 완료',
  CANCELLED: '거래 취소',
};

export default function SellPage() {
  const [transactions, setTransactions] = useState<MyPageTransaction[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    api.get(`/api/v1/users/me/transactions?tab=sell&page=${page}&size=${PAGE_SIZE}`)
      .then((res) =>{
        const fetchedTotalPages = res.data.data.totalPages;
        if (page > 0 && page >= fetchedTotalPages) {
          setPage(fetchedTotalPages - 1);
          return;
        }
        setTransactions(res.data.data.content);
        setTotalPages(fetchedTotalPages);
      })
      .catch(() => setTransactions([]));
  }, [page]);
  
  return (
    <section>
      <h1 className={styles.title}>판매내역</h1>

      {transactions.length === 0 ? (
        <div className={styles.empty}>판매 내역이 없습니다.</div>
      ) : (
        <>
        <div className={styles.list}>
          {transactions.map((t) => (
            <div key={t.id} className={styles.card}>
              <img src={t.imgUrl} alt="상품" className={styles.cardImg} />
              <div className={styles.cardInfo}>
                <p className={styles.cardTitle}>상품 #{t.postId}</p>
                <p className={styles.cardType}>{t.type === 'DIRECT' ? '직거래' : '택배'}</p>
              </div>
              <div className={styles.cardRight}>
                <p className={styles.cardPrice}>{t.amount.toLocaleString()}원</p>
                <p className={styles.cardStatus}>{statusLabels[t.status]}</p>
                <div className={styles.actionSlot} />
              </div>
            </div>
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}