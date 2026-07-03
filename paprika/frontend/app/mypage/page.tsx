/**
 * 마이페이지
 * 담당: E - 장인호
 */

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import api from '@/lib/api';
import { MyPageTransaction, WishListItem } from '@/types';
import styles from './page.module.css';
import MannerTemperature from '@/components/mypage/MannerTemperature';
import Pagination from '@/components/mypage/Pagination';
import CancelTransactionButton from '@/components/transactions/CancelTransactionButton';
import ConfirmTransactionButton from '@/components/transactions/ConfirmTransactionButton';

const PAGE_SIZE = 10;

type OrderTab = 'all' | 'buy' | 'buying' | 'sell' | 'selling' | 'cancelled';

const orderTabs: { key: OrderTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'buying', label: '구매중' },
  { key: 'buy', label: '구매내역' },
  { key: 'selling', label: '판매중' },
  { key: 'sell', label: '판매내역' },
  { key: 'cancelled', label: '취소내역' },
];

const orderEmptyMessages: Record<OrderTab, string> = {
  all: '거래 내역이 없습니다.',
  buy: '구매한 내역이 없습니다.',
  buying: '현재 구매 진행중인 상품이 없습니다.',
  sell: '판매한 내역이 없습니다.',
  selling: '현재 판매 중인 상품이 없습니다.',
  cancelled: '취소된 거래가 없습니다.',
};

const statusLabels: Record<string, string> = {
  PENDING: '예약중',
  AGREED: '예약중',
  COMPLETED: '거래 완료',
  CANCELLED: '거래 취소',
};

const cancelledByLabels: Record<string, string> = {
  BUYER: '구매자 취소',
  SELLER: '판매자 취소',
};

const orderTabKeys = orderTabs.map((tab) => tab.key);

function MyPageContent() {
  // 다른 화면(거래 완료 등)에서 /mypage?tab=buy 처럼 넘어올 때 해당 탭으로 바로 열어준다.
  // 값이 없거나 유효하지 않으면 기본값 '전체'로 시작한다.
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as OrderTab | null;
  const [activeOrderTab, setActiveOrderTab] = useState<OrderTab>(
    initialTab && orderTabKeys.includes(initialTab) ? initialTab : 'all'
  );
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<MyPageTransaction[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [temperature, setTemperature] = useState(50);
  const [trustGrade, setTrustGrade] = useState('보통');
  const [wishlistItems, setWishlistItems] = useState<WishListItem[]>([]);
  const [wishlistPage, setWishlistPage] = useState(0);
  const [wishlistTotalPages, setWishlistTotalPages] = useState(0);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  useEffect(() => {
    api.get('/api/v1/users/me')
      .then((res) => {
        const data = res.data;
        setNickname(data.nickname ?? '');
        setEmail(data.email ?? '');
        setProfileImageUrl(data.profileImageUrl ?? null);
        return api.get(`/api/v1/users/${data.id}/manner`);
      })
      .then((res) => {
        setTemperature(res.data.data.temperature);
        setTrustGrade(res.data.data.trustGrade);
      })

      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(0);
  }, [activeOrderTab]);

  useEffect(() => {
    api.get(`/api/v1/users/me/transactions?tab=${activeOrderTab}&page=${page}&size=${PAGE_SIZE}`)
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
  }, [activeOrderTab, page]);

  const fetchWishlist = () => {
    api.get(`/api/v1/users/me/wishlist?page=${wishlistPage}&size=${PAGE_SIZE}`)
      .then((res) => {
        const fetchedTotalPages = res.data.data.totalPages;
        if (wishlistPage > 0 && wishlistPage >= fetchedTotalPages) {
          setWishlistPage(fetchedTotalPages - 1);
          return;
        }
        setWishlistItems(res.data.data.content);
        setWishlistTotalPages(fetchedTotalPages);
      })
      .catch(() => setWishlistItems([]));
  };

  useEffect(() => {
    fetchWishlist();
  }, [wishlistPage]);

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

  const renderStatus = (t: MyPageTransaction) => {
    if (t.status === 'CANCELLED') {
      return t.cancelledBy ? cancelledByLabels[t.cancelledBy] : statusLabels.CANCELLED;
    }
    return statusLabels[t.status];
  };

  const renderAction = (t: MyPageTransaction) => {
    if (t.status === 'COMPLETED' && t.myRole === 'BUYER') {
      return t.reviewId ? (
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
      );
    }
    if (t.status === 'PENDING' || t.status === 'AGREED') {
      return (
        <div className={styles.actionButtons}>
          {t.myRole === 'SELLER' && (
            <ConfirmTransactionButton
              transactionId={t.id}
              className={styles.confirmTransactionBtn}
              onConfirmed={(confirmedId) =>
                setTransactions((prev) => prev.filter((tx) => tx.id !== confirmedId))
              }
            />
          )}
          <CancelTransactionButton
            transactionId={t.id}
            className={styles.cancelTransactionBtn}
            deleteHandler={(cancelledId) =>
              setTransactions((prev) => prev.filter((tx) => tx.id !== cancelledId))
            }
          />
        </div>
      );
    }
    return null;
  };

  return (
    <section className={styles.pageGrid}>

      {/* 프로필 요약 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>내 프로필</h1>
          <Link href="/mypage/profile" className={styles.editLink}>회원정보 수정 &gt;</Link>
        </div>
        <div className={styles.profileInfo}>
          <img src={profileImageUrl || '/images/avatar-placeholder.svg'} alt="프로필" className={styles.profileAvatar} />
          <div>
            <p className={styles.profileName}>{nickname}</p>
            <p className={styles.profileEmail}>이메일: {email}</p>
            <MannerTemperature score={temperature} />
          </div>
        </div>
      </div>

      {/* 거래 내역 */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>거래 내역</h2>
        <div className={styles.tabs}>
          {orderTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveOrderTab(tab.key)}
              className={`${styles.tab} ${activeOrderTab === tab.key ? styles.tabActive : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {transactions.length === 0 ? (
          <div className={styles.emptySmall}>{orderEmptyMessages[activeOrderTab]}</div>
        ) : (
          <>
            <div className={styles.list}>
              {transactions.map((t) => (
                <div key={t.id} className={styles.card}>
                  <img src={t.imgUrl} alt="상품" className={styles.cardImg} />
                  <div className={styles.cardInfo}>
                    <p className={styles.cardTitle}>
                      <Link href={`/products/${t.postId}`} className={styles.cardTitleLink}>
                        상품 #{t.postId}
                      </Link>
                      {' '}(거래 #{t.id})
                    </p>
                    <p className={styles.cardType}>
                      {t.type === 'DIRECT' ? '직거래' : '택배'} · {t.myRole === 'BUYER' ? '구매' : '판매'}
                    </p>
                  </div>
                  <div className={styles.cardRight}>
                    <p className={styles.cardPrice}>{t.amount.toLocaleString()}원</p>
                    <p className={styles.cardStatus}>{renderStatus(t)}</p>
                    <div className={styles.actionSlot}>{renderAction(t)}</div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* 관심 상품 */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>관심 상품</h2>

        {wishlistItems.length === 0 ? (
          <div className={styles.emptySmall}>찜한 상품이 없습니다.</div>
        ) : (
          <>
            <div className={styles.list}>
              {wishlistItems.map((item) => (
                <div key={item.id} className={styles.card}>
                  <img src={item.imgUrl} alt="상품" className={styles.cardImg} />
                  <div className={styles.cardInfo}>
                    <p className={styles.cardTitle}>{item.title}</p>
                  </div>
                  <button
                    onClick={() => {
                      api.delete(`/api/v1/users/me/wishlist/${item.productId}`)
                        .then(() => {
                          if (wishlistItems.length === 1 && wishlistPage > 0) {
                            setWishlistPage((p) => p - 1);
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
            <Pagination page={wishlistPage} totalPages={wishlistTotalPages} onPageChange={setWishlistPage} />
          </>
        )}
      </div>

      {selectedId && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalTitle}>{editingReviewId ? '리뷰 수정' : '리뷰 작성'}</p>
            <div className={styles.starRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  onClick={() => setRating(s)}
                  className={s <= rating ? styles.starFilled : styles.starEmpty}
                >
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
              <button className={styles.submitBtn} onClick={handleSubmit}>
                {editingReviewId ? '저장' : '제출'}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

export default function MyPage() {
  return (
    <Suspense fallback={<div>로딩중...</div>}>
      <MyPageContent />
    </Suspense>
  );
}