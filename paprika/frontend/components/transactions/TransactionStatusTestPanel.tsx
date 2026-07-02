'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { ApiResponse, PostInfo } from '@/types';
import styles from './TransactionStatusTestPanel.module.css';

interface TransactionItem {
  id: number;
  postId: number;
  status: string;
  type: string;
  sellerId: number;
  buyerId: number;
}

const POST_STATUS_LABEL: Record<string, string> = {
  SELLING: '판매중',
  RESERVED: '예약중',
  SOLD: '판매완료',
  DRAFT: '임시저장',
};

const TX_STATUS_LABEL: Record<string, string> = {
  PENDING: '거래 요청',
  AGREED: '거래 확정',
  COMPLETED: '거래 완료',
  CANCELLED: '거래 취소',
};

function postStatusClass(status: string) {
  if (status === 'SELLING') return styles.badgeSelling;
  if (status === 'RESERVED') return styles.badgeReserved;
  if (status === 'SOLD') return styles.badgeSold;
  return styles.badgeDefault;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return String(error.response.data.message);
  }
  return fallback;
}

/**
 * 거래 상태 ↔ Post 상태 연동 테스트 패널
 * URL: /transactions/test
 */
export default function TransactionStatusTestPanel() {
  const { user, loading: authLoading } = useAuth();
  const [postIdInput, setPostIdInput] = useState('1');
  const [postInfo, setPostInfo] = useState<PostInfo | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState('테스트를 시작하세요.');

  const postId = Number(postIdInput);

  const appendLog = (message: string) => {
    const time = new Date().toLocaleTimeString('ko-KR');
    setLog((prev) => `[${time}] ${message}\n${prev}`);
  };

  const loadPostInfo = useCallback(async () => {
    if (!Number.isFinite(postId) || postId <= 0) {
      setError('올바른 postId를 입력하세요.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<PostInfo>>(`/api/v1/transactions/post-info/${postId}`);
      setPostInfo(res.data.data);
      appendLog(`상품 조회 성공 — status=${res.data.data.status}`);
    } catch (e) {
      setPostInfo(null);
      const message = getErrorMessage(e, '상품 정보를 불러오지 못했습니다.');
      setError(message);
      appendLog(`상품 조회 실패 — ${message}`);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const loadMyTransactions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<TransactionItem[]>>('/api/v1/transactions');
      const filtered = res.data.data.filter((tx) => tx.postId === postId);
      setTransactions(filtered);

      if (filtered.length === 0) {
        setSelectedTxId(null);
      } else {
        setSelectedTxId((prev) =>
          prev != null && filtered.some((tx) => tx.id === prev) ? prev : filtered[0].id,
        );
      }

      appendLog(`내 거래 ${filtered.length}건 조회 (postId=${postId})`);
    } catch (e) {
      const message = getErrorMessage(e, '거래 목록을 불러오지 못했습니다.');
      setError(message);
      appendLog(`거래 목록 실패 — ${message}`);
    } finally {
      setLoading(false);
    }
  }, [postId, user]);

  useEffect(() => {
    if (user && Number.isFinite(postId) && postId > 0) {
      void loadPostInfo();
      void loadMyTransactions();
    }
  }, [user, postId, loadPostInfo, loadMyTransactions]);

  const refreshAll = async () => {
    await loadPostInfo();
    await loadMyTransactions();
  };

  const createDirectTransaction = async () => {
    if (!postInfo) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse<TransactionItem>>('/api/v1/transactions', {
        postId,
        type: 'DIRECT',
        itemPrice: postInfo.price,
        meetingLocation: '테스트 장소',
        meetingTime: new Date().toISOString().slice(0, 16),
      });
      const created = res.data.data;
      setSelectedTxId(created.id);
      appendLog(`거래 생성 — id=${created.id}, status=${created.status}`);
      await refreshAll();
    } catch (e) {
      const message = getErrorMessage(e, '거래 생성에 실패했습니다.');
      setError(message);
      appendLog(`거래 생성 실패 — ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const agreeTransaction = async () => {
    if (!selectedTxId) return;

    setLoading(true);
    setError(null);
    try {
      await api.patch(`/api/v1/transactions/${selectedTxId}/status`, { status: 'AGREED' });
      appendLog(`거래 확정(AGREED) — id=${selectedTxId} → Post RESERVED 예상`);
      await refreshAll();
    } catch (e) {
      const message = getErrorMessage(e, '거래 확정에 실패했습니다.');
      setError(message);
      appendLog(`거래 확정 실패 — ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const completeTransaction = async () => {
    if (!selectedTxId) return;

    setLoading(true);
    setError(null);
    try {
      await api.post(`/api/v1/transactions/${selectedTxId}/complete`);
      appendLog(`거래 완료(COMPLETED) — id=${selectedTxId} → Post SOLD 예상`);
      await refreshAll();
    } catch (e) {
      const message = getErrorMessage(e, '거래 완료에 실패했습니다.');
      setError(message);
      appendLog(`거래 완료 실패 — ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const cancelTransaction = async () => {
    if (!selectedTxId) return;
    if (!confirm('거래를 취소하시겠어요?')) return;

    setLoading(true);
    setError(null);
    try {
      await api.patch(`/api/v1/transactions/${selectedTxId}/status`, { status: 'CANCELLED' });
      appendLog(`거래 취소(CANCELLED) — id=${selectedTxId} → Post SELLING 예상`);
      await refreshAll();
    } catch (e) {
      const message = getErrorMessage(e, '거래 취소에 실패했습니다.');
      setError(message);
      appendLog(`거래 취소 실패 — ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedTransaction = transactions.find((tx) => tx.id === selectedTxId) ?? null;
  const hasAgreedOnPost = transactions.some((tx) => tx.status === 'AGREED');
  const canCancel =
    selectedTransaction != null &&
    (selectedTransaction.status === 'PENDING' || selectedTransaction.status === 'AGREED');

  if (authLoading) {
    return <p className={styles.empty}>로그인 확인 중...</p>;
  }

  if (!user) {
    return <p className={styles.empty}>로그인 후 테스트할 수 있습니다. (/login)</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>거래 ↔ Post 상태 테스트</h1>
      <p className={styles.subtitle}>
        PENDING → AGREED 시 Post가 예약중(RESERVED)으로 바뀌는지 확인합니다.
        구매자 계정으로 로그인하고, 본인이 올린 상품이 아닌 postId를 사용하세요.
      </p>

      <label className={styles.field}>
        <span className={styles.label}>상품 번호 (postId)</span>
        <input
          className={styles.input}
          type="number"
          min={1}
          value={postIdInput}
          onChange={(e) => setPostIdInput(e.target.value)}
        />
      </label>

      <div className={styles.buttonRow}>
        <button type="button" className={styles.buttonSecondary} disabled={loading} onClick={() => void refreshAll()}>
          새로고침
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={loading || !postInfo || hasAgreedOnPost}
          onClick={() => void createDirectTransaction()}
        >
          거래 생성 (PENDING)
        </button>
      </div>

      {hasAgreedOnPost && (
        <p className={styles.hint}>
          이 상품에 확정(AGREED)된 거래가 있습니다. 새 거래는 만들 수 없습니다.
          아래 목록에서 확정된 거래를 선택한 뒤 <strong>취소</strong>를 누르세요.
        </p>
      )}

      {postInfo && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>상품 (Post)</h2>
          <div className={styles.row}>
            <span>제목</span>
            <span>{postInfo.title}</span>
          </div>
          <div className={styles.row}>
            <span>가격</span>
            <span>{postInfo.price.toLocaleString()}원</span>
          </div>
          <div className={styles.row}>
            <span>판매자 ID</span>
            <span>{postInfo.sellerId}</span>
          </div>
          <div className={styles.row}>
            <span>Post 상태</span>
            <span className={postStatusClass(postInfo.status)}>
              {POST_STATUS_LABEL[postInfo.status] ?? postInfo.status}
            </span>
          </div>
        </section>
      )}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>거래 선택</h2>
        {transactions.length === 0 ? (
          <p className={styles.empty}>
            이 상품에 대한 내 진행 중 거래가 없습니다.
            <br />
            다른 계정이 확정한 거래라면, 그 구매자/판매자 계정으로 로그인해야 취소할 수 있습니다.
          </p>
        ) : (
          <select
            className={styles.input}
            value={selectedTxId ?? ''}
            onChange={(e) => setSelectedTxId(Number(e.target.value))}
          >
            {transactions.map((tx) => (
              <option key={tx.id} value={tx.id}>
                #{tx.id} — {TX_STATUS_LABEL[tx.status] ?? tx.status} ({tx.type})
              </option>
            ))}
          </select>
        )}
      </section>

      <div className={styles.buttonRow}>
        <button type="button" className={styles.button} disabled={loading || !selectedTxId} onClick={() => void agreeTransaction()}>
          확정 (AGREED → RESERVED)
        </button>
        <button type="button" className={styles.button} disabled={loading || !selectedTxId} onClick={() => void completeTransaction()}>
          완료 (COMPLETED → SOLD)
        </button>
        <button type="button" className={styles.buttonDanger} disabled={loading || !canCancel} onClick={() => void cancelTransaction()}>
          취소 (CANCELLED → SELLING)
        </button>
      </div>

      {selectedTransaction && !canCancel && (
        <p className={styles.hint}>
          선택한 거래는 {TX_STATUS_LABEL[selectedTransaction.status] ?? selectedTransaction.status} 상태라 취소할 수 없습니다.
        </p>
      )}

      {error && <p className={styles.error}>{error}</p>}
      <pre className={styles.log}>{log}</pre>
    </div>
  );
}
