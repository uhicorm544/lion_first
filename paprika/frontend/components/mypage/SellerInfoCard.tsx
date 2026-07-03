'use client';

/**
 * 판매자 정보 카드 (아바타 + 닉네임 + 매너온도, otheruser 프로필로 링크)
 * 담당: E - 장인호
 *
 * products/[id]/page.tsx의 "판매자 정보 및 매너 온도 표시" TODO(E) 항목용 컴포넌트.
 * B(products 페이지)는 이 컴포넌트만 import해서 끼우면 됨 — fetch/스타일 전부 내부에서 처리.
 *
 * 사용법:
 *   <div className={styles.sellerInfo}>
 *     <SellerInfoCard userId={product.userId} />
 *   </div>
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import type { PublicProfile, MannerTemperature as MannerTemperatureType } from '@/types';
import MannerTemperature from '@/components/mypage/MannerTemperature';
import styles from './SellerInfoCard.module.css';

const DEFAULT_AVATAR = '/images/avatar-placeholder.svg';

function formatJoinedAt(createdAt: string | null | undefined) {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')} 가입`;
}

interface SellerInfoCardProps {
  userId: number;
  /** 아바타+이름 링크 부분 className 덮어쓰기 (부모 페이지 스타일에 맞출 때) */
  metaClassName?: string;
}

export default function SellerInfoCard({ userId, metaClassName }: SellerInfoCardProps) {
  const [seller, setSeller] = useState<PublicProfile | null>(null);
  const [manner, setManner] = useState<MannerTemperatureType | null>(null);

  useEffect(() => {
    let active = true;
    api.get(`/api/v1/users/${userId}`)
      .then((res) => { if (active) setSeller(res.data.data); })
      .catch(() => {});
    api.get(`/api/v1/users/${userId}/manner`)
      .then((res) => { if (active) setManner(res.data.data); })
      .catch(() => {});
    return () => { active = false; };
  }, [userId]);

  return (
    <>
      <Link href={`/otheruser/${userId}`} className={metaClassName ?? styles.sellerMeta}>
        <div className={styles.avatar}>
          <img src={seller?.profileImageUrl || DEFAULT_AVATAR} alt={seller?.nickname ?? '판매자'} />
        </div>
        <div>
          <p className={styles.sellerName}>{seller?.nickname ?? `판매자 #${userId}`}</p>
          {formatJoinedAt(seller?.createdAt) && (
            <p className={styles.sellerSub}>{formatJoinedAt(seller?.createdAt)}</p>
          )}
        </div>
      </Link>
      <MannerTemperature score={manner?.temperature ?? 50} />
    </>
  );
}
