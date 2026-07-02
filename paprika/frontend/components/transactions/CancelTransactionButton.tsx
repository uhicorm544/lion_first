'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';
import styles from './CancelTransactionButton.module.css';

/** GET /api/v1/transactions 응답에서 취소 대상 찾을 때 쓰는 최소 필드 */
interface TransactionSummary {
  id: number;
  postId: number;
  status: string;
}

interface CancelTransactionButtonProps {
  /** 취소할 거래 id (마이페이지 목록 등 — 부모가 알고 있을 때) */
  transactionId?: number;
  /** 상품 id — transactionId 없을 때 내 진행 중 거래를 API로 찾을 때 사용 */
  postId?: number;
  /** API 성공 후 부모 목록에서 해당 거래를 제거하는 콜백 */
  deleteHandler: (id: number) => void;
  disabled?: boolean;
  className?: string;
  confirmMessage?: string;
}

/** 취소 가능한 거래 상태 — PENDING(요청), AGREED(확정)만 허용 */
const IN_PROGRESS = new Set(['PENDING', 'AGREED']);

/**
 * 거래 취소 버튼 (재사용 모듈)
 * 담당: D - 이동준
 *
 * ── 사용 패턴 (부모가 연결 값을 prop으로 넘김) ──
 * 1) 거래 id를 알 때 (마이페이지 목록 등):
 *    <CancelTransactionButton transactionId={item.id} deleteHandler={deleteHandler} />
 *
 * 2) 상품 id만 알 때:
 *    <CancelTransactionButton postId={item.postId} deleteHandler={deleteHandler} />
 *
 * ── 동작 흐름 ──
 * 1. transactionId prop 있음 → 그대로 사용
 * 2. 없으면 postId prop으로 내 거래 목록 API에서 진행 중 거래 1건 조회
 * 3. 둘 다 없거나 진행 중 거래 없음 → 버튼 숨김
 * 4. 클릭 → confirm → PATCH CANCELLED → deleteHandler(id)
 *
 * ※ 취소는 해당 거래의 구매자/판매자만 가능 (백엔드 검증)
 */
export default function CancelTransactionButton({
  transactionId: transactionIdProp,
  postId,
  deleteHandler,
  disabled = false,
  className,
  confirmMessage = '거래를 취소하시겠어요?',
}: CancelTransactionButtonProps) {
  //최종적으로 취소할 거래 ID
  const [resolvedId, setResolvedId] = useState<number | null>(transactionIdProp ?? null);
  //API로 거래 찾는 중인지
  const [resolving, setResolving] = useState(false);
  //취소 PATCH 요청 중인지
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
          (tx) => tx.postId === postId && IN_PROGRESS.has(tx.status),
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
      await api.patch(`/api/v1/transactions/${resolvedId}/status`, {
        status: 'CANCELLED',
      });
      deleteHandler(resolvedId);
    } catch (error) {
      const message =
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        '거래 취소에 실패했습니다. 잠시 후 다시 시도해 주세요.';
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
      {submitting ? '취소 중...' : resolving ? '확인 중...' : '거래 취소'}
    </button>
  );
}
