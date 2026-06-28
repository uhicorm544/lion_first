'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

// TODO: JWT 연동 후 로그인 사용자가 구매자/판매자 중 무엇인지로 결정
type ViewerRole = 'BUYER' | 'SELLER';
const viewerRole: ViewerRole = 'BUYER';

interface TransactionItem {
  id: number;
  meetingLocation: string;
  meetingTime: string;
}

function TransactionStatusContent() {
  const searchParams = useSearchParams();
  const cancelLabel = viewerRole === 'BUYER' ? '구매취소' : '판매취소';

  // TODO: 실제 거래 데이터 연동 전까지 약속 확정으로 넘어온 거래만 표시
  const [items, setItems] = useState<TransactionItem[]>(() => {
    const meetingLocation = searchParams.get('location') ?? '';
    const meetingTime = searchParams.get('time') ?? '';
    if (!meetingLocation && !meetingTime) {
      return [];
      }
    return [
      {
        //각 거래를 구분할 고유 식별자
        id: Date.now(),
        meetingLocation,
        meetingTime,
      },
    ];
  });

  const handleCancel = (id: number) => {
    if (!confirm(`${cancelLabel} 하시겠어요?`)) {
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>거래 상태</h1>

        {items.length === 0 ? (
          <p className={styles.empty}>진행 중인 거래가 없습니다.</p>
        ) : (
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id} className={styles.card}>
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

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => handleCancel(item.id)}
                >
                  {cancelLabel}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default function TransactionStatusPage() {
  return (
    <Suspense fallback={null}>
      <TransactionStatusContent />
    </Suspense>
  );
}
