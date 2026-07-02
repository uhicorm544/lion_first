/**
 * 마이페이지
 * 담당: E - 장인호
 *
 * TODO:
 *  - 받은 리뷰 목록 미리보기
 *  - 로그아웃 버튼 (A - 민동현과 연동)
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { MyPageTransaction, WishListItem } from '@/types';
import styles from './page.module.css';
import MannerTemperature from '@/components/mypage/MannerTemperature';

const WISHLIST_PREVIEW_COUNT = 5;
const TRANSACTION_PREVIEW_COUNT = 5;

type OrderTab = 'all' | 'buy' | 'sell' | 'selling';

const orderTabs: { key: OrderTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'buy', label: '구매내역' },
  { key: 'sell', label: '판매내역' },
  { key: 'selling', label: '판매중' },
];

const orderEmptyMessages: Record<OrderTab, string> = {
  all: '거래 내역이 없습니다.',
  buy: '구매한 내역이 없습니다.',
  sell: '판매한 내역이 없습니다.',
  selling: '판매중인 상품이 없습니다.',
};

const statusLabels: Record<string, string> = {
  PENDING: '거래 요청',
  AGREED: '거래 확정',
  COMPLETED: '거래 완료',
  CANCELLED: '거래 취소',
};

export default function MyPage() {
  const [activeOrderTab, setActiveOrderTab] = useState<OrderTab>('all');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<MyPageTransaction[]>([]);
  const [temperature, setTemperature] = useState(50);
  const [trustGrade, setTrustGrade] = useState('보통');
  const [wishlistItems, setWishlistItems] = useState<WishListItem[]>([]);

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
    api.get(`/api/v1/users/me/transactions?tab=${activeOrderTab}`)
      .then((res) => setTransactions(res.data.data.content))
      .catch(() => setTransactions([]));
  }, [activeOrderTab]);

  useEffect(() => {
    api.get('/api/v1/users/me/wishlist')
      .then((res) => setWishlistItems(res.data.data.content))
      .catch(() => setWishlistItems([]));
  }, []);

  return (
    <section className={styles.pageGrid}>

      {/* 프로필 요약 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>내 프로필</h1>
          <Link href="/mypage/profile" className={styles.editLink}>회원정보 수정 &gt;</Link>
        </div>
        <div className={styles.profileInfo}>
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="프로필" className={styles.profileAvatar} />
          ) : (
            <div className={styles.profileAvatarPlaceholder} />
          )}
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
          <div className={styles.transactionList}>
            {transactions.slice(0, TRANSACTION_PREVIEW_COUNT).map((t) => (
              <div key={t.id} className={styles.transactionCard}>
                <img src={t.imgUrl} alt="상품" className={styles.transactionImg} />
                <div className={styles.transactionInfo}>
                  <p className={styles.transactionTitle}>상품 #{t.postId}</p>
                  <p className={styles.transactionMeta}>
                    {t.type === 'DIRECT' ? '직거래' : '택배'} · {t.myRole === 'BUYER' ? '구매' : '판매'}
                  </p>
                  <p className={styles.transactionPrice}>{t.amount.toLocaleString()}원</p>
                  <p className={styles.transactionStatus}>{statusLabels[t.status]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 관심 상품 */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>관심 상품</h2>

        {wishlistItems.length === 0 ? (
          <div className={styles.emptySmall}>찜한 상품이 없습니다.</div>
        ) : (
          <div className={styles.transactionList}>
            {wishlistItems.slice(0, WISHLIST_PREVIEW_COUNT).map((item) => (
              <div key={item.id} className={styles.transactionCard}>
                <img src={item.imgUrl} alt="상품" className={styles.transactionImg} />
                <div className={styles.transactionInfo}>
                  <p className={styles.transactionTitle}>{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}