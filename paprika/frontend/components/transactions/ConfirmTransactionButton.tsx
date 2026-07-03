'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';
import styles from './ConfirmTransactionButton.module.css';

/** GET /api/v1/transactions 응답에서 확정 대상 찾을 때 쓰는 최소 필드 */
interface TransactionSummary {
  id: number;
  postId: number;
  status: string;
}

interface ConfirmTransactionButtonProps {
  /** 확정할 거래 id (마이페이지 목록 등 — 부모가 알고 있을 때) */
  transactionId?: number;
  /** 상품 id — transactionId 없을 때 내 예약중 거래를 API로 찾을 때 사용 */
  postId?: number;
  /** API 성공 후 부모 목록에서 해당 거래를 갱신·제거하는 콜백 */
  onConfirmed: (id: number) => void;
  disabled?: boolean;
  className?: string;
  confirmMessage?: string;
}

/** 확정 가능한 거래 상태 — AGREED(예약중 = 상품 RESERVED) 만 허용 */
const CONFIRMABLE = new Set(['AGREED']);

/**
 * 거래 확정(완료) 버튼 (재사용 모듈)
 * 담당: D - 이동준
 *
 * ── 사용 패턴 (부모가 연결 값을 prop으로 넘김) ──
 * 1) 거래 id를 알 때 (마이페이지 목록 등):
 *    <ConfirmTransactionButton transactionId={item.id} onConfirmed={reload} />
 *
 * 2) 상품 id만 알 때:
 *    <ConfirmTransactionButton postId={item.postId} onConfirmed={reload} />
 *
 * ── 동작 흐름 ──
 * 1. transactionId prop 있음 → 그대로 사용
 * 2. 없으면 postId prop으로 내 거래 목록 API에서 AGREED 거래 1건 조회
 * 3. 둘 다 없거나 확정 가능한 거래 없음 → 버튼 숨김
 * 4. 클릭 → confirm → POST /{id}/complete → onConfirmed(id)
 *    - 거래(transactions.status): AGREED → COMPLETED
 *    - 상품(post.post_status):   RESERVED → SOLD
 *
 * ※ 확정(완료)은 해당 거래의 구매자/판매자만 가능 (백엔드 검증 대상)
 */
export default function ConfirmTransactionButton({
  transactionId: transactionIdProp,
  postId,
  onConfirmed,
  disabled = false,
  className,
  confirmMessage = '거래를 확정하시겠어요? 판매완료로 처리됩니다.',
}: ConfirmTransactionButtonProps) {
  //최종적으로 확정할 거래 ID
  const [resolvedId, setResolvedId] = useState<number | null>(transactionIdProp ?? null);
  //API로 거래 찾는 중인지
  const [resolving, setResolving] = useState(false);
  //완료 POST 요청 중인지
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transactionIdProp != null) {
      setResolvedId(transactionIdProp);
      return;
    }

    if (postId == null) {
      setResolvedId(null);
      return;
    }

    let active = true;
    setResolving(true);

    api
      .get<ApiResponse<TransactionSummary[]>>('/api/v1/transactions')
      .then((response) => {
        if (!active) return;
        const mine = (response.data.data ?? []).find(
          (tx) => tx.postId === postId && CONFIRMABLE.has(tx.status),
        );
        setResolvedId(mine?.id ?? null);
      })
      .catch(() => {
        if (active) setResolvedId(null);
      })
      //조회끝나면 확인중 문구해제
      .finally(() => {
        if (active) setResolving(false);
      });

    return () => {
      active = false;
    };
  }, [transactionIdProp, postId]);

  const handleClick = async () => {
    if (resolvedId == null) {
      return;
    }
    if (!confirm(confirmMessage)) {
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/api/v1/transactions/${resolvedId}/complete`);
      onConfirmed(resolvedId);
    } catch (error) {
      const message =
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        '거래 확정에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (resolvedId == null && !resolving) {
    return null;
  }

  return (
    <button
      type="button"
      className={className ?? styles.button}
      disabled={disabled || submitting || resolving || resolvedId == null}
      onClick={handleClick}
    >
      {submitting ? '확정 중...' : resolving ? '확인 중...' : '거래 확정'}
    </button>
  );
}
