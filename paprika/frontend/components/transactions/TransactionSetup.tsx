'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { ApiResponse, PostInfo } from '@/types';
import styles from './TransactionSetup.module.css';

type PaymentMethod = 'CASH' | 'CARD';
type TransactionType = 'DIRECT' | 'DELIVERY';

interface TransactionSummary {
  postId: number;
  status: string;
}

interface TransactionSetupProps {
  /** URL 쿼리 대신 prop으로 postId를 넘길 때 사용 */
  postId?: string | null;
  /** 이미 진행 중인 거래가 있을 때 이동할 경로 */
  statusRedirectPath?: string;
}

const IN_PROGRESS = new Set(['PENDING', 'AGREED']);

/**
 * 거래 방식 선택 (재사용 모듈)
 * 담당: D - 이동준
 *
 * 상품 postId 기준으로 상품 정보를 보여주고 직거래/택배를 선택한다.
 * 같은 상품에 내 진행 중(PENDING/AGREED) 거래가 있으면 상태 페이지로 보낸다.
 *
 * 라우트(/transactions?postId=)뿐 아니라 <TransactionSetup postId="1" /> 로 끼워 쓸 수 있다.
 */
export default function TransactionSetup({
  postId: postIdProp,
  statusRedirectPath = '/transactions/status/test',
}: TransactionSetupProps) {
  const searchParams = useSearchParams();
  const postId = postIdProp ?? searchParams.get('postId');

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [postInfo, setPostInfo] = useState<PostInfo | null>(null);
  const [postError, setPostError] = useState(false);
  const [checkingEntry, setCheckingEntry] = useState(false);

  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);

  // 진행 중 거래가 있으면 상태 페이지로 이동
  useEffect(() => {
    if (authLoading || !user || !postId) {
      return;
    }

    let active = true;
    setCheckingEntry(true);

    api
      .get<ApiResponse<TransactionSummary[]>>('/api/v1/transactions')
      .then((response) => {
        if (!active) return;
        const mine = (response.data.data ?? []).find(
          (tx) => tx.postId === Number(postId) && IN_PROGRESS.has(tx.status),
        );
        if (mine) {
          router.replace(statusRedirectPath);
        }
      })
      .catch(() => {
        // 진입 검사 실패 시에도 새 거래 화면은 계속 표시
      })
      .finally(() => {
        if (active) setCheckingEntry(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, user, postId, router, statusRedirectPath]);

  // postId로 상품명·가격 조회
  useEffect(() => {
    if (!postId) {
      return;
    }

    let active = true;
    api
      .get<ApiResponse<PostInfo>>(`/api/v1/transactions/post-info/${postId}`)
      .then((response) => {
        if (active) {
          setPostInfo(response.data.data);
        }
      })
      .catch(() => {
        if (active) {
          setPostError(true);
        }
      });

    return () => {
      active = false;
    };
  }, [postId]);

  const isDirect = transactionType === 'DIRECT';

  const selectDirect = () => {
    setTransactionType('DIRECT');
    setPayment(null);
  };

  const handleComplete = () => {
    if (!isDirect || !postId) {
      return;
    }
    const params = new URLSearchParams();
    params.set('postId', postId);
    if (postInfo) {
      params.set('price', String(postInfo.price));
    }
    router.push(`/transactions/direct?${params.toString()}`);
  };

  if (!postId) {
    return <p className={styles.empty}>상품 정보가 없습니다. 상품 상세에서 거래하기를 눌러 주세요.</p>;
  }

  if (authLoading || checkingEntry) {
    return <p className={styles.empty}>거래 정보를 확인하는 중...</p>;
  }

  if (!user) {
    return <p className={styles.empty}>로그인 후 거래를 시작할 수 있습니다.</p>;
  }

  return (
    <div className={styles.container}>
      {postInfo && (
        <div className={styles.productSummary}>
          <div className={styles.productInfo}>
            <span className={styles.productTitle}>{postInfo.title}</span>
            <span className={styles.productSeller}>판매자 ID: {postInfo.sellerId}</span>
          </div>
          <span className={styles.productPrice}>{postInfo.price.toLocaleString()}원</span>
        </div>
      )}
      {postError && <p className={styles.productError}>상품 정보를 불러오지 못했습니다.</p>}

      <div className={styles.buttonRow}>
        <button
          type="button"
          className={payment === 'CASH' ? styles.optionActive : styles.optionButton}
          disabled={isDirect}
          onClick={() => setPayment('CASH')}
        >
          현금결제
        </button>
        <button
          type="button"
          className={payment === 'CARD' ? styles.optionActive : styles.optionButton}
          disabled={isDirect}
          onClick={() => setPayment('CARD')}
        >
          카드결제
        </button>
      </div>

      <div className={styles.buttonRow}>
        <button
          type="button"
          className={transactionType === 'DIRECT' ? styles.optionActive : styles.optionButton}
          onClick={selectDirect}
        >
          직거래
        </button>
        <button
          type="button"
          className={transactionType === 'DELIVERY' ? styles.optionActive : styles.optionButton}
          onClick={() => setTransactionType('DELIVERY')}
        >
          택배거래
        </button>
      </div>

      <button
        type="button"
        className={styles.completeButton}
        disabled={!isDirect}
        onClick={handleComplete}
      >
        완료
      </button>
    </div>
  );
}
