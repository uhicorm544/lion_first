'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { MyPageTransaction } from '@/types';
import Pagination from '@/components/mypage/Pagination';
import sharedStyles from '../page.module.css';
import styles from './page.module.css';

const PAGE_SIZE = 10;
const statusLabels: Record<string, string> = {
  PENDING: '거래 요청',
  AGREED: '거래 확정',
  COMPLETED: '거래 완료',
  CANCELLED: '거래 취소',
};

export default function BuyOrdersPage() {
  const [transactions, setTransactions] = useState<MyPageTransaction[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  useEffect(() => {
    api.get(`/api/v1/users/me/transactions?tab=buy&page=${page}&size=${PAGE_SIZE}`)
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

  const closeModal = () => {
    setSelectedId(null);
    setEditingReviewId(null);
    setRating(5);
    setContent('');
  };

  const openCreateModal = (transactionId: number) => {
    setSelectedId(transactionId);
    setEditingReviewId(null);
    setRating(5);
    setContent('');
  };

  const openEditModal = (transactionId: number, reviewId: number) => {
    api.get(`/api/v1/reviews/${reviewId}`)
      .then((res) => {
        const review = res.data.data;
        setSelectedId(transactionId);
        setEditingReviewId(reviewId);
        setRating(review.rating);
        setContent(review.content ?? '');
      })
      .catch(() => alert('리뷰 정보를 불러오지 못했습니다.'));
  };

  const handleSubmit = async () => {
    if (!selectedId) return;
    try {
      if (editingReviewId) {
        await api.patch(`/api/v1/reviews/${editingReviewId}`, { rating, content });
        alert('리뷰가 수정되었습니다!');
      } else {
        const res = await api.post('/api/v1/reviews', { transactionId: selectedId, rating, content });
        const newReviewId = res.data.data.id;
        setTransactions((prev) =>
          prev.map((t) => (t.id === selectedId ? { ...t, reviewId: newReviewId } : t))
        );
        alert('리뷰가 작성되었습니다!');
      }
      closeModal();
    } catch {
      alert(editingReviewId ? '리뷰 수정 실패' : '리뷰 작성 실패');
    }
  };

  const handleDelete = async () => {
    if (!editingReviewId || !selectedId) return;
    if (!confirm('리뷰를 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/api/v1/reviews/${editingReviewId}`);
      setTransactions((prev) =>
        prev.map((t) => (t.id === selectedId ? { ...t, reviewId: null } : t))
      );
      alert('리뷰가 삭제되었습니다.');
      closeModal();
    } catch {
      alert('리뷰 삭제 실패');
    }
  };

  return (
    <section>
      <h1 className={sharedStyles.title}>구매내역</h1>

      {transactions.length === 0 ? (
        <div className={sharedStyles.empty}>구매한 내역이 없습니다.</div>
      ) : (
        <>
        <div className={sharedStyles.list}>
          {transactions.map((t) => (
            <div key={t.id} className={sharedStyles.card}>
              <img src={t.imgUrl} alt="상품" className={sharedStyles.cardImg} />
              <div className={sharedStyles.cardInfo}>
                <p className={sharedStyles.cardTitle}>상품 #{t.postId} (거래 #{t.id})</p>
                <p className={sharedStyles.cardType}>{t.type === 'DIRECT' ? '직거래' : '택배'}</p>
              </div>
              <div className={sharedStyles.cardRight}>
                <p className={sharedStyles.cardPrice}>{t.amount.toLocaleString()}원</p>
                <p className={sharedStyles.cardStatus}>{statusLabels[t.status]}</p>
                <div className={sharedStyles.actionSlot}>
                  {t.status === 'COMPLETED' && (
                    t.reviewId ? (
                      <div className={styles.reviewedRow}>
                        <span className={styles.reviewedBadge}>작성완료</span>
                        <button className={styles.editBtn} onClick={() => openEditModal(t.id, t.reviewId!)}>
                          수정
                        </button>
                      </div>
                    ) : (
                      <button className={styles.reviewBtn} onClick={() => openCreateModal(t.id)}>
                        리뷰 작성
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {selectedId && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalTitle}>{editingReviewId ? '리뷰 수정' : '리뷰 작성'}</p>
            <div className={styles.starRow}>
              {[1,2,3,4,5].map((s) => (
                <span key={s} onClick={() => setRating(s)}
                  className={s <= rating ? styles.starFilled : styles.starEmpty}>
                  ★
                </span>
              ))}
            </div>
            <textarea
              className={styles.textarea}
              placeholder="거래 후기를 작성해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className={styles.modalBtns}>
              {editingReviewId && (
                <button className={styles.deleteBtn} onClick={handleDelete}>삭제</button>
              )}
              <button className={styles.cancelBtn} onClick={closeModal}>취소</button>
              <button className={styles.submitBtn} onClick={handleSubmit}>{editingReviewId ? '저장' : '제출'}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}