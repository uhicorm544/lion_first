'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { ApiResponse } from '@/types';
import styles from './TransactionStatus.module.css';

type TransactionType = 'DIRECT' | 'DELIVERY';

const TYPE_LABEL: Record<TransactionType, string> = {
  DIRECT: '직거래',
  DELIVERY: '배달',
};

// 백엔드 GET /api/v1/transactions 응답 (TransactionResponse 일부)
interface TransactionResponse {
  id: number;
  type: TransactionType;
  status: string;
  sellerId: number;
  buyerId: number;
  meetingLocation?: string;
  meetingTime?: string;
}

interface TransactionItem {
  id: number;
  type: TransactionType;
  sellerId: number;
  meetingLocation: string;
  meetingTime: string;
  completed: boolean;
}

interface TransactionStatusProps {
  // 다른 화면(마이페이지 등)에 끼워 넣을 때 제목을 끄거나 바꾸기 위한 옵션
  title?: string | null;
}

/**
 * 거래 상태 목록 (재사용 모듈)
 * 담당: D - 이동준
 *
 * 내(구매자/판매자) 진행 중 거래를 조회해 보여준다.
 * - 판매확정: 해당 거래의 판매자에게만 노출 (완료 처리)
 * - 거래 취소: 구매자/판매자 모두 가능
 *
 * 라우트 페이지뿐 아니라 어디서든 <TransactionStatus /> 로 끼워 쓸 수 있다.
 */
export default function TransactionStatus({ title = '거래 상태' }: TransactionStatusProps) {
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;

  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loadError, setLoadError] = useState(false);

  // 진입(재방문 포함) 시 내 진행 중 거래 목록을 DB에서 조회해 표시
  useEffect(() => {
    let active = true;
    api
      .get<ApiResponse<TransactionResponse[]>>('/api/v1/transactions')
      .then((response) => {
        if (!active) return;
        const list = response.data.data ?? [];
        setItems(
          list.map((tx) => ({
            id: tx.id,
            type: tx.type,
            sellerId: tx.sellerId,
            meetingLocation: tx.meetingLocation ?? '',
            meetingTime: tx.meetingTime ? tx.meetingTime.replace('T', ' ') : '',
            completed: tx.status === 'COMPLETED',
          })),
        );
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // 판매확정: 판매자가 거래 완료(COMPLETED)를 요청한다.
  const confirmSeller = async (id: number) => {
    try {
      await api.post(`/api/v1/transactions/${id}/complete`);
    } catch {
      // 백엔드 오류 시에도 데모 흐름은 계속 진행
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: true } : item)),
    );
  };

  const handleCancel = async (id: number) => {
    if (!confirm('거래를 취소하시겠어요?')) {
      return;
    }
    //확인을 누른 뒤 실제 거래를 취소(CANCELLED) 처리 요청
    try {
      await api.patch(`/api/v1/transactions/${id}/status`, { status: 'CANCELLED' });
    } catch {
      // 백엔드 오류 시에도 데모 흐름은 계속 진행
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className={styles.container}>
      {title && <h1 className={styles.title}>{title}</h1>}

      {loadError ? (
        <p className={styles.empty}>거래 정보를 불러오지 못했습니다.</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>진행 중인 거래가 없습니다.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => {
            // 판매확정은 해당 거래의 판매자에게만 노출
            const isSeller = currentUserId != null && currentUserId === item.sellerId;
            return (
              <li key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.typeBadge}>{TYPE_LABEL[item.type]}</span>
                  {item.completed && <span className={styles.doneBadge}>거래 완료</span>}
                </div>

                <div className={styles.info}>
                  <div className={styles.meetingRow}>
                    <span className={styles.meetingLabel}>장소</span>
                    <span className={styles.meetingValue}>{item.meetingLocation || '-'}</span>
                  </div>
                  <div className={styles.meetingRow}>
                    <span className={styles.meetingLabel}>날짜·시간</span>
                    <span className={styles.meetingValue}>{item.meetingTime || '-'}</span>
                  </div>
                </div>

                {/* 직거래이고 판매자 화면일 때만 판매확정 버튼 노출 */}
                {item.type === 'DIRECT' && !item.completed && isSeller && (
                  <div className={styles.confirmRow}>
                    <button
                      type="button"
                      className={styles.confirmButton}
                      onClick={() => confirmSeller(item.id)}
                    >
                      판매확정
                    </button>
                  </div>
                )}

                {!item.completed && (
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => handleCancel(item.id)}
                  >
                    거래 취소
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
