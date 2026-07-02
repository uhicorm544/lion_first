'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { MyPageTransaction } from '@/types';
import Pagination from '@/components/mypage/Pagination';
import styles from '../page.module.css';

const PAGE_SIZE = 10;

const cancelledByLabels: Record<string, string> = {
  BUYER: '구매자 취소',
  SELLER: '판매자 취소',
};

export default function CanceledPage() {
  const [transactions, setTransactions] = useState<MyPageTransaction[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    api.get(`/api/v1/users/me/transactions?tab=cancelled&page=${page}&size=${PAGE_SIZE}`)
      .then((res) => {
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
      <h1 className={styles.title}>취소내역</h1>

      {transactions.length === 0 ? (
        <div className={styles.empty}>취소된 거래가 없습니다.</div>
      ) : (
        <>
        <div className={styles.list}>
          {transactions.map((t) => (
            <div key={t.id} className={styles.card}>
              <img src={t.imgUrl} alt="상품" className={styles.cardImg} />
              <div className={styles.cardInfo}>
                <p className={styles.cardTitle}>상품 #{t.postId} (거래 #{t.id})</p>
                <p className={styles.cardType}>
                  {t.type === 'DIRECT' ? '직거래' : '택배'} · {t.myRole === 'BUYER' ? '구매' : '판매'}
                </p>
              </div>
              <div className={styles.cardRight}>
                <p className={styles.cardPrice}>{t.amount.toLocaleString()}원</p>
                <p className={styles.cardStatus}>
                  {t.cancelledBy ? cancelledByLabels[t.cancelledBy] : '거래 취소'}
                </p>
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
