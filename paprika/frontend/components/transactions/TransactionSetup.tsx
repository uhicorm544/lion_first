'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { ApiResponse, PostInfo } from '@/types';
import styles from './TransactionSetup.module.css';

type PaymentMethod = 'CASH' | 'CARD';
type TransactionType = 'DIRECT' | 'DELIVERY';

interface TransactionSetupProps {
  // 다른 화면(모달·상품 상세 등)에 끼워 넣을 때 제목을 끄거나 바꾸기 위한 옵션
  title?: string | null;
  // URL 쿼리 대신 prop으로 postId를 넘길 때 사용
  postId?: string | null;
  // 택배 거래 생성 완료 후 이동할 경로
  statusRedirectPath?: string;
}

const CARD_FEE_RATE = 0.035;

/**
 * 거래 방식 선택 (재사용 모듈)
 * 담당: D - 이동준
 *
 * 상품 postId 기준으로 상품 정보를 보여주고 직거래/택배를 선택한다.
 *
 * 라우트(/transactions?postId=)뿐 아니라 어디서든 <TransactionSetup postId="1" /> 로 끼워 쓸 수 있다.
 */
export default function TransactionSetup({ title = '거래 방식 선택', postId: postIdProp, statusRedirectPath = '/mypage?tab=buy' }: TransactionSetupProps) {
  const searchParams = useSearchParams();
  const postId = postIdProp ?? searchParams.get('postId');

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [postInfo, setPostInfo] = useState<PostInfo | null>(null);
  const [postError, setPostError] = useState(false);

  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
  const isDelivery = transactionType === 'DELIVERY';
  const basePrice = postInfo?.price ?? 0;
  const cardFee = payment === 'CARD' ? Math.round(basePrice * CARD_FEE_RATE) : 0;
  const displayPrice = payment === 'CARD' ? basePrice + cardFee : basePrice;
  const canComplete = isDirect || (isDelivery && payment !== null);

  const selectDirect = () => {
    setTransactionType('DIRECT');
    setPayment(null);
  };

  const handleComplete = async () => {
    if (!postId || !postInfo) {
      return;
    }

    if (isDirect) {
      const params = new URLSearchParams();
      params.set('postId', postId);
      params.set('price', String(postInfo.price));
      router.push(`/transactions/direct?${params.toString()}`);
      return;
    }

    if (!isDelivery || !payment) {
      return;
    }
    //지금 서버 저장중이라고 알려주는 것
    setSubmitting(true);
    console.log("postId: ", postId);
    try {
      await api.post('/api/v1/transactions', {
        postId: Number(postId),
        type: 'DELIVERY',
        itemPrice: postInfo.price,
        paymentMethod: payment,
      });
      alert('택배 거래가 생성되었습니다.');
      router.push(statusRedirectPath);
    } catch (error) {
      const message =
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        '택배 거래 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
   };

  if (!postId) {
    return <p className={styles.empty}>상품 정보가 없습니다. 상품 상세에서 거래하기를 눌러 주세요.</p>;
  }

  if (authLoading) {
    return <p className={styles.empty}>거래 정보를 확인하는 중...</p>;
  }

  if (!user) {
    return <p className={styles.empty}>로그인 후 거래를 시작할 수 있습니다.</p>;
  }

  return (
    <div className={styles.container}>
      {title && <h1 className={styles.title}>{title}</h1>}
      {postInfo && (
        <div className={styles.productSummary}>
          <div className={styles.productInfo}>
            <span className={styles.productTitle}>{postInfo.title}</span>
            <span className={styles.productSeller}>판매자 ID: {postInfo.sellerId}</span>
          </div>
          <div className={styles.priceBlock}>
            {payment === 'CARD' ? (
              <>
                <span className={styles.productPriceLabel}>최종 가격</span>
                <span className={styles.productPrice}>{displayPrice.toLocaleString()}원</span>
                <span className={styles.productPriceDetail}>
                  상품 {basePrice.toLocaleString()}원 + 수수료 3.5% ({cardFee.toLocaleString()}원)
                </span>
              </>
            ) : (
              <span className={styles.productPrice}>{basePrice.toLocaleString()}원</span>
            )}
          </div>
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
        //아직 완료 준비가 안됬던가 API 저장 요청중이면 버튼 비활성화
        disabled={!canComplete || submitting}
        onClick={handleComplete}
      >
        {submitting ? '저장 중...' : '완료'}
      </button>
    </div>
  );
}
