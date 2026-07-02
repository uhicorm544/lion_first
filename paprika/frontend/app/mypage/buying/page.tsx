'use client';

/**
 * 구매중 페이지
 * 담당: E - 장인호
 *
 * 내가 구매자인 거래 중 진행중(PENDING/AGREED)인 것만 보여준다.
 * 완료/취소 건은 각각 구매내역/취소내역 탭으로 이동한다.
 *
 * TODO: 거래취소 버튼은 UI만 있고 아직 실제로 취소 요청을 보내지 않는다.
 *       D(이동준)님이 만든 PATCH /api/v1/transactions/{id}/status (status: CANCELLED)에 연동 예정.
 */
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { MyPageTransaction } from '@/types';
import Pagination from '@/components/mypage/Pagination';
import styles from '../page.module.css';

const PAGE_SIZE = 10;
const statusLabels: Record<string, string> = {
  PENDING: '거래 요청',
  AGREED: '거래 확정',
};

export default function BuyingPage() {
  const [transactions, setTransactions] = useState<MyPageTransaction[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    api.get(`/api/v1/users/me/transactions?tab=buying&page=${page}&size=${PAGE_SIZE}`)
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
      <h1 className={styles.title}>구매중</h1>

      {transactions.length === 0 ? (
        <div className={styles.empty}>현재 구매 진행중인 상품이 없습니다.</div>
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
                <div className={styles.actionSlot}>
                  <button className={styles.cancelTransactionBtn} type="button">
                    거래취소
                  </button>
                </div>
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
